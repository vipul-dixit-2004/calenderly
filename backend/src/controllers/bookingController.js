import { db } from '../db/index.js';
import {
  users, eventTypes, availabilitySchedules,
  availabilityRules, availabilityOverrides, meetings,
} from '../db/schema.js';
import { eq, and, lt, gt } from 'drizzle-orm';
import * as mailService from '../services/mail/index.js';
import { meetQueue } from '../services/meetQueue.js';
import { fromZonedTime } from 'date-fns-tz';

// GET /bookings/:username — public profile: user info + all active event types
export const getPublicEventTypes = async (req, res, next) => {
  try {
    const { username } = req.params;
    const [owner] = await db.select().from(users).where(eq(users.username, username));
    if (!owner) return res.status(404).json({ error: 'User not found' });

    const events = await db
      .select({
        id:          eventTypes.id,
        title:       eventTypes.title,
        slug:        eventTypes.slug,
        duration:    eventTypes.duration,
        description: eventTypes.description,
        meetType:    eventTypes.meetType,
        color:       eventTypes.color,
      })
      .from(eventTypes)
      .where(and(
        eq(eventTypes.userId,   owner.id),
        eq(eventTypes.isActive, true),
      ))
      .orderBy(eventTypes.createdAt);

    res.json({
      user: {
        name:     owner.name,
        username: owner.username,
        timezone: owner.timezone,
      },
      eventTypes: events,
    });
  } catch (err) { next(err); }
};

export const getEventBySlug = async (req, res, next) => {
  try {
    const { username, slug } = req.params;
    
    // First find the user by username
    const [owner] = await db.select().from(users).where(eq(users.username, username));
    if (!owner) return res.status(404).json({ error: 'User not found' });
    const ownerId = owner.id;

    // Join event type with its owner's details
    const [row] = await db
      .select({
        id:           eventTypes.id,
        title:        eventTypes.title,
        slug:         eventTypes.slug,
        duration:     eventTypes.duration,
        description:  eventTypes.description,
        meetType:     eventTypes.meetType,
        color:        eventTypes.color,
        hostName:     users.name,
        hostTimezone: users.timezone,
      })
      .from(eventTypes)
      .innerJoin(users, eq(users.id, eventTypes.userId))
      .where(and(
        eq(eventTypes.slug,     slug),
        eq(eventTypes.userId,   ownerId),
        eq(eventTypes.isActive, true),
      ));

    if (!row) return res.status(404).json({ error: 'Event type not found' });
    res.json(row);
  } catch (err) { next(err); }
};

export const getAvailableSlots = async (req, res, next) => {
  try {
    const { username, slug } = req.params;
    const { date, timezone } = req.query;   // 'YYYY-MM-DD'
    const inviteeTz = timezone || 'UTC';
    
    // 0. Fetch user by username
    const [owner] = await db.select().from(users).where(eq(users.username, username));
    if (!owner) return res.status(404).json({ error: 'User not found' });
    const ownerId = owner.id;

    // 1. Fetch event type
    const [eventType] = await db
      .select()
      .from(eventTypes)
      .where(and(
        eq(eventTypes.slug,     slug),
        eq(eventTypes.userId,   ownerId),
        eq(eventTypes.isActive, true),
      ));
    if (!eventType) return res.status(404).json({ error: 'Event not found' });

    // 2. Fetch default schedule
    const [schedule] = await db
      .select()
      .from(availabilitySchedules)
      .where(and(
        eq(availabilitySchedules.userId,    ownerId),
        eq(availabilitySchedules.isDefault, true),
      ));
    if (!schedule) return res.json([]);

    const hostTz = schedule.timezone || owner.timezone || 'UTC';

    // 3. We check 3 consecutive days in the host's timezone to cover timezone offsets for the single requested invitee date
    const refDateUTC = fromZonedTime(`${date}T12:00:00`, inviteeTz);
    
    const hostDateStr = new Intl.DateTimeFormat('en-CA', { 
      timeZone: hostTz, 
      year: 'numeric', month: '2-digit', day: '2-digit' 
    }).format(refDateUTC);

    const [hy, hm, hd] = hostDateStr.split('-').map(Number);
    const hostDateRef = new Date(hy, hm - 1, hd);

    const daysToCheck = [-1, 0, 1].map(offset => {
      const d = new Date(hostDateRef);
      d.setDate(d.getDate() + offset);
      return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    });

    const allSlotsUTC = [];

    // 4. Generate candidate slots from all availability windows
    for (const checkDate of daysToCheck) {
      const [override] = await db
        .select()
        .from(availabilityOverrides)
        .where(and(
          eq(availabilityOverrides.scheduleId, schedule.id),
          eq(availabilityOverrides.overrideDate, checkDate),
        ));

      if (override?.isUnavailable) continue;

      let windows = [];
      if (override && !override.isUnavailable) {
        windows = [{ start: override.startTime, end: override.endTime }];
      } else {
        const dayOfWeek = new Date(checkDate + 'T12:00:00').getDay(); // 0=Sun
        const dayRules = await db
          .select()
          .from(availabilityRules)
          .where(and(
            eq(availabilityRules.scheduleId, schedule.id),
            eq(availabilityRules.dayOfWeek, dayOfWeek),
          ));
        if (dayRules.length > 0) {
          windows = dayRules.map(r => ({ start: r.startTime, end: r.endTime }));
        }
      }

      for (const w of windows) {
        const [sh, sm] = w.start.split(':').map(Number);
        const [eh, em] = w.end.split(':').map(Number);
        let current = sh * 60 + sm;
        const end = eh * 60 + em;
        while (current + eventType.duration <= end) {
          const hh = String(Math.floor(current / 60)).padStart(2, '0');
          const mm = String(current % 60).padStart(2, '0');
          const localDateTimeStr = `${checkDate}T${hh}:${mm}:00`;
          allSlotsUTC.push(fromZonedTime(localDateTimeStr, hostTz));
          current += eventType.duration;
        }
      }
    }

    // 5. Filter generated slots to only keep those that fall EXACTLY on the requested `date` in the invitee's timezone
    const validSlots = allSlotsUTC.filter(slotUTC => {
       const slotDateInInviteeTz = new Intl.DateTimeFormat('en-CA', { 
         timeZone: inviteeTz, year: 'numeric', month: '2-digit', day: '2-digit' 
       }).format(slotUTC);
       return slotDateInInviteeTz === date;
    });

    if (validSlots.length === 0) return res.json([]);

    // 6. Fetch booked slots that overlap with any valid slots
    const minTime = new Date(Math.min(...validSlots.map(s => s.getTime())));
    const maxTime = new Date(Math.max(...validSlots.map(s => s.getTime())));
    const maxEndTime = new Date(maxTime.getTime() + eventType.duration * 60000);

    const booked = await db
      .select({ startTime: meetings.startTime, endTime: meetings.endTime })
      .from(meetings)
      .where(and(
        eq(meetings.eventTypeId, eventType.id),
        eq(meetings.status, 'scheduled'),
        lt(meetings.startTime, maxEndTime),
        gt(meetings.endTime, minTime),
      ));

    // Overlap check for each slot (more accurate than set matching due to duration)
    const available = validSlots
      .filter(slot => {
        const slotStart = slot.getTime();
        const slotEnd = slotStart + eventType.duration * 60000;
        const isBooked = booked.some(b => {
          const bStart = b.startTime.getTime();
          const bEnd = b.endTime.getTime();
          return slotStart < bEnd && slotEnd > bStart;
        });
        return !isBooked;
      })
      .map(s => s.toISOString());

    res.json(available);
  } catch (err) { next(err); }
};

export const createBooking = async (req, res, next) => {
  try {
    const { username, slug } = req.params;
    const { inviteeName, inviteeEmail, startTime, meetAddress, meetPhone } = req.body;

    // Fetch user by username
    const [owner] = await db.select().from(users).where(eq(users.username, username));
    if (!owner) return res.status(404).json({ error: 'User not found' });
    const ownerId = owner.id;

    const [eventType] = await db
      .select()
      .from(eventTypes)
      .where(and(
        eq(eventTypes.slug,     slug),
        eq(eventTypes.userId,   ownerId),
        eq(eventTypes.isActive, true),
      ));
    if (!eventType) return res.status(404).json({ error: 'Event not found' });

    const startDt = new Date(startTime);
    const endDt   = new Date(startDt.getTime() + eventType.duration * 60000);

    // Double-booking check: overlapping interval query
    const conflicts = await db
      .select({ id: meetings.id })
      .from(meetings)
      .where(and(
        eq(meetings.eventTypeId, eventType.id),
        eq(meetings.status,      'scheduled'),
        lt(meetings.startTime,   endDt),
        gt(meetings.endTime,     startDt),
      ));
    if (conflicts.length > 0)
      return res.status(409).json({ error: 'Time slot is already booked' });

    const [meeting] = await db
      .insert(meetings)
      .values({
        eventTypeId:  eventType.id,
        inviteeName,
        inviteeEmail,
        startTime:    startDt,
        endTime:      endDt,
        meetUrl:      null, // will be populated async for google_meet
        meetAddress:  eventType.meetType === 'offline' ? meetAddress : null,
        meetPhone:    eventType.meetType === 'phone' ? meetPhone : null,
      })
      .returning();

    res.status(201).json({ meeting, eventType });

    // Build the common email payload
    const emailPayload = {
      to: inviteeEmail,
      subject: `Meeting Confirmed: ${eventType.title}`,
      template: 'booking-confirmation',
      data: {
        inviteeName,
        hostName: owner.name,
        eventTitle: eventType.title,
        startTime: meeting.startTime,
        endTime: meeting.endTime,
        duration: eventType.duration,
        meetType: eventType.meetType,
        meetUrl: null,
        meetAddress: meeting.meetAddress,
        meetPhone: meeting.meetPhone,
        meetingId: meeting.id,
        appUrl: process.env.FRONTEND_URL || 'http://localhost:3000',
      },
    };

    if (eventType.meetType === 'google_meet') {
      // Async: generate Meet link → update DB → send email
      meetQueue.add({
        meetingId: meeting.id,
        summary: `${eventType.title} — ${inviteeName} & ${owner.name}`,
        description: eventType.description || '',
        startTime: meeting.startTime,
        endTime: meeting.endTime,
        attendeeEmail: inviteeEmail,
        emailPayload,
        hostEmail: owner.email,
        hostName: owner.name,
      });
    } else {
      // Non-Meet bookings: send email immediately
      mailService.send(emailPayload)
        .catch(err => console.error('Failed to queue confirmation email:', err));
    }
  } catch (err) { next(err); }
};

export const getMeetingForReschedule = async (req, res, next) => {
  try {
    const { meetingId } = req.params;

    const [row] = await db
      .select({
        meeting: meetings,
        eventType: eventTypes,
        host: {
          name: users.name,
          username: users.username,
          timezone: users.timezone,
        }
      })
      .from(meetings)
      .innerJoin(eventTypes, eq(eventTypes.id, meetings.eventTypeId))
      .innerJoin(users, eq(users.id, eventTypes.userId))
      .where(eq(meetings.id, meetingId));

    if (!row) return res.status(404).json({ error: 'Meeting not found' });
    if (row.meeting.status !== 'scheduled') {
      return res.status(400).json({ error: 'Only scheduled meetings can be rescheduled' });
    }

    res.json({
      ...row.meeting,
      eventTitle: row.eventType.title,
      duration: row.eventType.duration,
      color: row.eventType.color,
      meetType: row.eventType.meetType,
      slug: row.eventType.slug,
      hostName: row.host.name,
      hostUsername: row.host.username,
      hostTimezone: row.host.timezone,
    });
  } catch (err) { next(err); }
};

export const rescheduleBooking = async (req, res, next) => {
  try {
    const { meetingId } = req.params;
    const { startTime, reason } = req.body;

    const [row] = await db
      .select({
        meeting: meetings,
        eventType: eventTypes,
        host: {
          name: users.name,
          email: users.email,
        }
      })
      .from(meetings)
      .innerJoin(eventTypes, eq(eventTypes.id, meetings.eventTypeId))
      .innerJoin(users, eq(users.id, eventTypes.userId))
      .where(eq(meetings.id, meetingId));

    if (!row) return res.status(404).json({ error: 'Meeting not found' });
    if (row.meeting.status !== 'scheduled') {
      return res.status(400).json({ error: 'Only scheduled meetings can be rescheduled' });
    }

    const startDt = new Date(startTime);
    const endDt = new Date(startDt.getTime() + row.eventType.duration * 60000);

    // Double-booking check: overlapping interval query
    const conflicts = await db
      .select({ id: meetings.id })
      .from(meetings)
      .where(and(
        eq(meetings.eventTypeId, row.eventType.id),
        eq(meetings.status,      'scheduled'),
        lt(meetings.startTime,   endDt),
        gt(meetings.endTime,     startDt),
      ));
    
    // Make sure we don't conflict with ourselves (though if we are just moving, the old one is us)
    const trueConflicts = conflicts.filter(c => c.id !== meetingId);
    if (trueConflicts.length > 0) {
      return res.status(409).json({ error: 'Time slot is already booked' });
    }

    const oldStartTime = row.meeting.startTime;
    
    // Append the reschedule reason to the cancel reason for record-keeping if provided
    let newCancelReason = row.meeting.cancelReason;
    if (reason) {
      const entry = `Rescheduled to ${startDt.toISOString()}. Reason: ${reason}`;
      newCancelReason = newCancelReason ? `${newCancelReason}\n${entry}` : entry;
    }

    const [updatedMeeting] = await db
      .update(meetings)
      .set({
        startTime: startDt,
        endTime: endDt,
        cancelReason: newCancelReason,
      })
      .where(eq(meetings.id, meetingId))
      .returning();

    res.json({ meeting: updatedMeeting });

    // Build reschedule email payload
    const rescheduleEmailPayload = {
      to: row.meeting.inviteeEmail,
      subject: `Meeting Rescheduled: ${row.eventType.title}`,
      template: 'booking-rescheduled',
      data: {
        inviteeName: row.meeting.inviteeName,
        hostName: row.host.name,
        eventTitle: row.eventType.title,
        oldStartTime: oldStartTime,
        newStartTime: updatedMeeting.startTime,
        duration: row.eventType.duration,
        meetType: row.eventType.meetType,
        meetUrl: updatedMeeting.meetUrl,
        meetAddress: updatedMeeting.meetAddress,
        meetPhone: updatedMeeting.meetPhone,
        reason: reason || 'No reason provided',
        hostEmail: row.host.email,
        meetingId: updatedMeeting.id,
        appUrl: process.env.FRONTEND_URL || 'http://localhost:3000',
      },
    };

    if (row.eventType.meetType === 'google_meet') {
      // Async: regenerate Meet link for the new time → update DB → send email
      meetQueue.add({
        meetingId: updatedMeeting.id,
        summary: `${row.eventType.title} — ${row.meeting.inviteeName} & ${row.host.name}`,
        description: row.eventType.description || '',
        startTime: updatedMeeting.startTime,
        endTime: updatedMeeting.endTime,
        attendeeEmail: row.meeting.inviteeEmail,
        emailPayload: rescheduleEmailPayload,
        hostEmail: row.host.email,
        hostName: row.host.name,
      });
    } else {
      mailService.send(rescheduleEmailPayload)
        .catch(err => console.error('Failed to queue reschedule email:', err));
    }

  } catch (err) { next(err); }
};

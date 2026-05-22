import { db } from '../db/index.js';
import {
  users, eventTypes, availabilitySchedules,
  availabilityRules, availabilityOverrides, meetings,
} from '../db/schema.js';
import { eq, and, lt, gt, sql } from 'drizzle-orm';

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
    const { date } = req.query;   // 'YYYY-MM-DD'
    
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

    // 3. Check for date override
    const [override] = await db
      .select()
      .from(availabilityOverrides)
      .where(and(
        eq(availabilityOverrides.scheduleId,   schedule.id),
        eq(availabilityOverrides.overrideDate, date),
      ));
    if (override?.isUnavailable) return res.json([]);

    // 4. Determine availability window
    let windowStart, windowEnd;
    if (override && !override.isUnavailable) {
      windowStart = override.startTime;
      windowEnd   = override.endTime;
    } else {
      const dayOfWeek = new Date(date + 'T12:00:00').getDay(); // 0=Sun
      const [rule] = await db
        .select()
        .from(availabilityRules)
        .where(and(
          eq(availabilityRules.scheduleId, schedule.id),
          eq(availabilityRules.dayOfWeek,  dayOfWeek),
        ));
      if (!rule) return res.json([]);
      windowStart = rule.startTime;
      windowEnd   = rule.endTime;
    }

    // 5. Generate candidate slots
    const [sh, sm] = windowStart.split(':').map(Number);
    const [eh, em] = windowEnd.split(':').map(Number);
    const slots    = [];
    let current    = sh * 60 + sm;
    const end      = eh * 60 + em;
    while (current + eventType.duration <= end) {
      const hh = String(Math.floor(current / 60)).padStart(2, '0');
      const mm = String(current % 60).padStart(2, '0');
      slots.push(new Date(`${date}T${hh}:${mm}:00.000Z`));
      current += eventType.duration;
    }

    // 6. Fetch booked slots for that day
    const dayStart = new Date(`${date}T00:00:00.000Z`);
    const dayEnd   = new Date(`${date}T23:59:59.999Z`);
    const booked   = await db
      .select({ startTime: meetings.startTime })
      .from(meetings)
      .where(and(
        eq(meetings.eventTypeId, eventType.id),
        eq(meetings.status,      'scheduled'),
        gt(meetings.startTime,   dayStart),
        lt(meetings.startTime,   dayEnd),
      ));
    const bookedSet = new Set(booked.map(b => b.startTime.toISOString()));

    const available = slots
      .filter(s => !bookedSet.has(s.toISOString()))
      .map(s => s.toISOString());

    res.json(available);
  } catch (err) { next(err); }
};

export const createBooking = async (req, res, next) => {
  try {
    const { username, slug } = req.params;
    const { inviteeName, inviteeEmail, startTime } = req.body;

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
      })
      .returning();

    res.status(201).json({ meeting, eventType });
  } catch (err) { next(err); }
};

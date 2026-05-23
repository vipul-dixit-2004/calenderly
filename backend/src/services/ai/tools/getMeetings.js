import { db } from '../../../db/index.js';
import { meetings, eventTypes } from '../../../db/schema.js';
import { and, eq, gt, gte, lte, desc, asc } from 'drizzle-orm';

export async function getMeetingsTool({ userId, userTimezone, args }) {
  const status = args.status || 'upcoming';
  const limit  = Math.min(args.limit ?? 50, 200);
  const now    = new Date();

  let where;
  switch (status) {
    case 'today': {
      const { dayStart, dayEnd } = userLocalDayBounds(now, userTimezone);
      where = and(
        eq(eventTypes.userId, userId),
        gte(meetings.startTime, dayStart),
        lte(meetings.startTime, dayEnd),
      );
      break;
    }
    case 'this_week': {
      const { weekStart, weekEnd } = userLocalWeekBounds(now, userTimezone);
      where = and(
        eq(eventTypes.userId, userId),
        gte(meetings.startTime, weekStart),
        lte(meetings.startTime, weekEnd),
      );
      break;
    }
    case 'upcoming':
      where = and(
        eq(eventTypes.userId, userId),
        gt(meetings.startTime, now),
        eq(meetings.status, 'scheduled'),
      );
      break;
    case 'past':
      where = and(
        eq(eventTypes.userId, userId),
        lte(meetings.startTime, now),
      );
      break;
    default:
      where = eq(eventTypes.userId, userId);
  }

  const rows = await db
    .select({
      id:           meetings.id,
      inviteeName:  meetings.inviteeName,
      inviteeEmail: meetings.inviteeEmail,
      startTime:    meetings.startTime,
      endTime:      meetings.endTime,
      status:       meetings.status,
      cancelReason: meetings.cancelReason,
      eventTitle:   eventTypes.title,
      duration:     eventTypes.duration,
      meetUrl:      meetings.meetUrl,
      meetType:     eventTypes.meetType,
    })
    .from(meetings)
    .innerJoin(eventTypes, eq(eventTypes.id, meetings.eventTypeId))
    .where(where)
    .orderBy(status === 'past' ? desc(meetings.startTime) : asc(meetings.startTime))
    .limit(limit);

  return { count: rows.length, meetings: rows };
}

function userLocalDayBounds(now, tz) {
  const fmt = new Intl.DateTimeFormat('en-CA', {
    timeZone: tz,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });
  const ymd = fmt.format(now);
  const startLocal = new Date(`${ymd}T00:00:00`);
  const endLocal   = new Date(`${ymd}T23:59:59.999`);
  return { dayStart: startLocal, dayEnd: endLocal };
}

function userLocalWeekBounds(now, tz) {
  const { dayStart } = userLocalDayBounds(now, tz);
  const dow = dayStart.getDay();
  const weekStart = new Date(dayStart.getTime() - dow * 86400000);
  const weekEnd   = new Date(weekStart.getTime() + 7 * 86400000 - 1);
  return { weekStart, weekEnd };
}

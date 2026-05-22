import { db } from '../db/index.js';
import { meetings, eventTypes, users } from '../db/schema.js';
import { eq, and, gt, lte, or, inArray, desc } from 'drizzle-orm';

export const list = async (req, res, next) => {
  try {
    const userId = req.headers['x-user-id'];
    const { status = 'all' } = req.query;
    const now = new Date();

    // Build conditions
    const ownerCondition = eq(eventTypes.userId, userId);

    const statusCondition =
      status === 'upcoming'
        ? and(gt(meetings.startTime, now), eq(meetings.status, 'scheduled'))
        : status === 'past'
        ? or(lte(meetings.startTime, now), inArray(meetings.status, ['cancelled', 'completed']))
        : undefined;

    const rows = await db
      .select({
        id:           meetings.id,
        inviteeName:  meetings.inviteeName,
        inviteeEmail: meetings.inviteeEmail,
        startTime:    meetings.startTime,
        endTime:      meetings.endTime,
        status:       meetings.status,
        cancelReason: meetings.cancelReason,
        createdAt:    meetings.createdAt,
        eventTitle:   eventTypes.title,
        duration:     eventTypes.duration,
        color:        eventTypes.color,
        slug:         eventTypes.slug,
      })
      .from(meetings)
      .innerJoin(eventTypes, eq(eventTypes.id, meetings.eventTypeId))
      .where(statusCondition ? and(ownerCondition, statusCondition) : ownerCondition)
      .orderBy(desc(meetings.startTime));

    res.json(rows);
  } catch (err) { next(err); }
};

export const getOne = async (req, res, next) => {
  try {
    const userId = req.headers['x-user-id'];
    const [row] = await db
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
        color:        eventTypes.color,
        slug:         eventTypes.slug,
        hostName:     users.name,
      })
      .from(meetings)
      .innerJoin(eventTypes, eq(eventTypes.id, meetings.eventTypeId))
      .innerJoin(users,      eq(users.id,       eventTypes.userId))
      .where(and(
        eq(meetings.id,       req.params.id),
        eq(eventTypes.userId, userId),
      ));

    if (!row) return res.status(404).json({ error: 'Not found' });
    res.json(row);
  } catch (err) { next(err); }
};

export const cancel = async (req, res, next) => {
  try {
    const userId = req.headers['x-user-id'];
    const { cancelReason } = req.body;

    // Verify the meeting belongs to the user via its event type
    const [existing] = await db
      .select({ id: meetings.id })
      .from(meetings)
      .innerJoin(eventTypes, eq(eventTypes.id, meetings.eventTypeId))
      .where(and(
        eq(meetings.id,       req.params.id),
        eq(eventTypes.userId, userId),
      ));
    if (!existing) return res.status(404).json({ error: 'Not found' });

    const [updated] = await db
      .update(meetings)
      .set({ status: 'cancelled', cancelReason: cancelReason || null })
      .where(eq(meetings.id, req.params.id))
      .returning();

    res.json(updated);
  } catch (err) { next(err); }
};

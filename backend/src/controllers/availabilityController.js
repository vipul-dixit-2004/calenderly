import { db } from '../db/index.js';
import {
  availabilitySchedules,
  availabilityRules,
  availabilityOverrides,
} from '../db/schema.js';
import { eq, and } from 'drizzle-orm';

// Helper: get the default schedule for a user
const getDefaultSchedule = (userId) =>
  db.select()
    .from(availabilitySchedules)
    .where(and(
      eq(availabilitySchedules.userId,    userId),
      eq(availabilitySchedules.isDefault, true),
    ))
    .limit(1)
    .then(rows => rows[0]);

export const getSchedule = async (req, res, next) => {
  try {
    const userId = req.headers['x-user-id'];
    const schedule = await getDefaultSchedule(userId);
    if (!schedule) return res.status(404).json({ error: 'No schedule found' });

    const rules = await db
      .select()
      .from(availabilityRules)
      .where(eq(availabilityRules.scheduleId, schedule.id))
      .orderBy(availabilityRules.dayOfWeek);

    res.json({ schedule, rules });
  } catch (err) { next(err); }
};

// Replace all rules for the default schedule (wrapped in a transaction)
export const upsertRules = async (req, res, next) => {
  try {
    const userId = req.headers['x-user-id'];
    const schedule = await getDefaultSchedule(userId);
    if (!schedule) return res.status(404).json({ error: 'No schedule found' });

    const { rules } = req.body; // [{ dayOfWeek, startTime, endTime }]

    const updated = await db.transaction(async (tx) => {
      await tx
        .delete(availabilityRules)
        .where(eq(availabilityRules.scheduleId, schedule.id));

      if (rules.length === 0) return [];

      return tx
        .insert(availabilityRules)
        .values(rules.map(r => ({
          scheduleId: schedule.id,
          dayOfWeek:  r.dayOfWeek,
          startTime:  r.startTime,
          endTime:    r.endTime,
        })))
        .returning();
    });

    res.json(updated);
  } catch (err) { next(err); }
};

export const updateTimezone = async (req, res, next) => {
  try {
    const userId = req.headers['x-user-id'];
    const { timezone } = req.body;
    const schedule = await getDefaultSchedule(userId);
    if (!schedule) return res.status(404).json({ error: 'No schedule found' });

    const [updated] = await db
      .update(availabilitySchedules)
      .set({ timezone })
      .where(eq(availabilitySchedules.id, schedule.id))
      .returning();
    res.json(updated);
  } catch (err) { next(err); }
};

export const listOverrides = async (req, res, next) => {
  try {
    const userId = req.headers['x-user-id'];
    const schedule = await getDefaultSchedule(userId);
    if (!schedule) return res.json([]);

    const rows = await db
      .select()
      .from(availabilityOverrides)
      .where(eq(availabilityOverrides.scheduleId, schedule.id))
      .orderBy(availabilityOverrides.overrideDate);
    res.json(rows);
  } catch (err) { next(err); }
};

export const addOverride = async (req, res, next) => {
  try {
    const userId = req.headers['x-user-id'];
    const { overrideDate, isUnavailable, startTime, endTime } = req.body;
    const schedule = await getDefaultSchedule(userId);
    if (!schedule) return res.status(404).json({ error: 'No schedule found' });

    // Upsert: update if same date already exists
    const [row] = await db
      .insert(availabilityOverrides)
      .values({ scheduleId: schedule.id, overrideDate, isUnavailable, startTime, endTime })
      .onConflictDoUpdate({
        target: [availabilityOverrides.scheduleId, availabilityOverrides.overrideDate],
        set:    { isUnavailable, startTime, endTime },
      })
      .returning();
    res.status(201).json(row);
  } catch (err) { next(err); }
};

export const removeOverride = async (req, res, next) => {
  try {
    await db
      .delete(availabilityOverrides)
      .where(eq(availabilityOverrides.id, req.params.id));
    res.status(204).send();
  } catch (err) { next(err); }
};

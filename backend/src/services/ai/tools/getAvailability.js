import { db } from '../../../db/index.js';
import {
  availabilitySchedules,
  availabilityRules,
  availabilityOverrides,
} from '../../../db/schema.js';
import { and, eq } from 'drizzle-orm';

const DAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

export async function getAvailabilityTool({ userId }) {
  const [schedule] = await db
    .select()
    .from(availabilitySchedules)
    .where(and(
      eq(availabilitySchedules.userId, userId),
      eq(availabilitySchedules.isDefault, true),
    ))
    .limit(1);

  if (!schedule) return { schedule: null, rules: [], overrides: [] };

  const [rules, overrides] = await Promise.all([
    db.select().from(availabilityRules)
      .where(eq(availabilityRules.scheduleId, schedule.id))
      .orderBy(availabilityRules.dayOfWeek),
    db.select().from(availabilityOverrides)
      .where(eq(availabilityOverrides.scheduleId, schedule.id))
      .orderBy(availabilityOverrides.overrideDate),
  ]);

  // Annotate rules with day names for model readability
  const namedRules = rules.map(r => ({
    ...r,
    dayName: DAY_NAMES[r.dayOfWeek] ?? `Day ${r.dayOfWeek}`,
  }));

  return { schedule, rules: namedRules, overrides };
}

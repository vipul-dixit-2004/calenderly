import { db } from '../../../db/index.js';
import { eventTypes } from '../../../db/schema.js';
import { and, eq } from 'drizzle-orm';

export async function getEventTypesTool({ userId, args }) {
  const conds = [eq(eventTypes.userId, userId)];
  if (args?.activeOnly) conds.push(eq(eventTypes.isActive, true));

  const rows = await db
    .select()
    .from(eventTypes)
    .where(and(...conds))
    .orderBy(eventTypes.createdAt);

  return { count: rows.length, eventTypes: rows };
}

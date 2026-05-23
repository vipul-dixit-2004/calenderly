import 'dotenv/config';
import { neon } from '@neondatabase/serverless';

const sqlClient = neon(process.env.DATABASE_URL);

const FORBIDDEN_PATTERNS = [
  /\binsert\b/i,
  /\bupdate\b/i,
  /\bdelete\b/i,
  /\bdrop\b/i,
  /\balter\b/i,
  /\btruncate\b/i,
  /\bcreate\b/i,
  /\bgrant\b/i,
  /\brevoke\b/i,
  /\bcopy\b/i,
  /\bvacuum\b/i,
  /\breindex\b/i,
  /\bdo\b\s+\$\$/i,
  /\bcall\b/i,
  /\breturning\b/i,
  /\bmerge\b/i,
  /\bpg_/i,
  /\binformation_schema\b/i,
];

export function validateSql(rawSql) {
  const stripped = rawSql
    .replace(/--.*$/gm, '')
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .trim()
    .replace(/;+\s*$/, '');

  if (!stripped) return { ok: false, reason: 'Empty query.' };

  if (!/^(select|with)\b/i.test(stripped)) {
    return { ok: false, reason: 'Query must start with SELECT or WITH.' };
  }

  if (stripped.includes(';')) {
    return { ok: false, reason: 'Multiple statements are not allowed.' };
  }

  for (const re of FORBIDDEN_PATTERNS) {
    if (re.test(stripped)) {
      return { ok: false, reason: `Forbidden pattern detected in query.` };
    }
  }

  return { ok: true, sql: stripped };
}

export async function runReadOnlySelect({ sql: rawSql, userId }) {
  const v = validateSql(rawSql);
  if (!v.ok) throw new Error(`SQL rejected: ${v.reason}`);

  if (!v.sql.includes(userId)) {
    throw new Error(
      `SQL rejected: query must reference the current user_id ('${userId}') in a WHERE clause.`,
    );
  }

  const limit = Number(process.env.AI_SQL_ROW_LIMIT || 200);
  const final = /\blimit\s+\d+/i.test(v.sql) ? v.sql : `${v.sql} LIMIT ${limit}`;

  const rows = await sqlClient(final);
  return { rows, rowCount: rows.length };
}

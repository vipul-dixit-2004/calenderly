import 'dotenv/config';
import { neon, Pool } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import { drizzle as drizzleWs } from 'drizzle-orm/neon-serverless';
import * as schema from './schema.js';

const sql = neon(process.env.DATABASE_URL);

export const db = drizzle(sql, { schema });

// WebSocket-based client — supports interactive transactions and row locks
// (SELECT ... FOR UPDATE). Use only where a transaction is required, e.g. booking.
// Relies on the global WebSocket available in Node 22+.
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

export const txDb = drizzleWs(pool, { schema });

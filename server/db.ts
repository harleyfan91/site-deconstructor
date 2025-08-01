import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from '../shared/schema.js';

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL not set');
}

let dbHost = 'unknown';
try {
  dbHost = new URL(process.env.DATABASE_URL).host;
} catch {}
console.log('🔗 Database connection string configured for host:', dbHost);

const connectionString = process.env.DATABASE_URL!;

export const sql = postgres(connectionString, {
  max: 10,
  idle_timeout: 20,
  connect_timeout: 10,
});

export const db = drizzle(sql, { schema });

import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from '../shared/schema.js';

const DATABASE_URL = 'postgresql://postgres.kdkuhrbaftksknfgjcch:[YOUR-PASSWORD]@aws-0-us-east-1.pooler.supabase.com:6543/postgres';

let dbHost = 'unknown';
try {
  dbHost = new URL(DATABASE_URL).host;
} catch {}
console.log('🔗 Database connection string configured for host:', dbHost);

const connectionString = DATABASE_URL;

export const sql = postgres(connectionString, {
  max: 10,
  idle_timeout: 20,
  connect_timeout: 10,
});

export const db = drizzle(sql, { schema });

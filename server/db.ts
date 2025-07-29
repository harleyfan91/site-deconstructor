import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from '../shared/schema.js';

// Extract project ID from Supabase URL
const extractProjectId = (url: string): string => {
  return url.replace('https://', '').replace('.supabase.co', '');
};

// Build connection string
const buildConnectionString = (): string => {
  const supabaseUrl = process.env.VITE_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error('Missing required environment variables: VITE_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
  }

  const projectId = extractProjectId(supabaseUrl);
  return `postgresql://postgres.${projectId}:${serviceRoleKey}@aws-0-us-west-1.pooler.supabase.com:5432/postgres`;
};

const connectionString = process.env.DATABASE_URL || buildConnectionString();

console.log('🔗 Database connection string configured for project:', connectionString.includes('postgres.') ? connectionString.split('postgres.')[1].split(':')[0] : 'unknown');

export const sql = postgres(connectionString, {
  max: 10,
  idle_timeout: 20,
  connect_timeout: 10,
});

export const db = drizzle(sql, { schema });
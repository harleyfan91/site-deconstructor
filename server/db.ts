import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from "../shared/schema";

// Function to get the connection string
function getConnectionString() {
  // First try DATABASE_URL (for drizzle compatibility)
  if (process.env.DATABASE_URL) {
    console.log('🔗 Using DATABASE_URL for connection');
    return process.env.DATABASE_URL;
  }

  // Fallback to Supabase connection configuration
  const supabaseUrl = process.env.VITE_SUPABASE_URL;
  const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseServiceRoleKey) {
    throw new Error(
      "Either DATABASE_URL or both VITE_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set for database connection"
    );
  }

  // Extract project ID from Supabase URL for direct PostgreSQL connection
  const projectId = supabaseUrl.replace('https://', '').replace('.supabase.co', '');
  const connectionString = `postgresql://postgres.${projectId}:${supabaseServiceRoleKey}@aws-0-us-west-1.pooler.supabase.com:5432/postgres`;
  
  // Set DATABASE_URL for future use
  process.env.DATABASE_URL = connectionString;
  console.log('🔗 Configured DATABASE_URL from Supabase environment variables');
  
  return connectionString;
}

const connectionString = getConnectionString();
console.log('🔗 Connecting to Supabase PostgreSQL...');

export const sql = postgres(connectionString, { 
  max: 10,
  idle_timeout: 20,
  connect_timeout: 10
});
export const db = drizzle(sql, { schema });

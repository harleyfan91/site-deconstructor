
import { defineConfig } from "drizzle-kit";

// Function to get the connection string (same logic as server/db.ts)
function getConnectionString() {
  // First try DATABASE_URL
  if (process.env.DATABASE_URL) {
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
  
  return connectionString;
}

const connectionString = getConnectionString();

export default defineConfig({
  out: "./migrations",
  schema: "./shared/schema.ts",
  dialect: "postgresql",
  dbCredentials: {
    url: connectionString,
  },
});

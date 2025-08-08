
import { defineConfig } from "drizzle-kit";

const connectionString = 'postgresql://postgres.kdkuhrbaftksknfgjcch:[YOUR-PASSWORD]@aws-0-us-east-1.pooler.supabase.com:6543/postgres';

export default defineConfig({
  out: "./migrations",
  schema: "./shared/schema.ts",
  dialect: "postgresql",
  dbCredentials: {
    url: connectionString,
  },
});

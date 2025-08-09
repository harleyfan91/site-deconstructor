CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE TABLE IF NOT EXISTS "scan_results" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "url" text NOT NULL,
  "requested_at" timestamptz NOT NULL DEFAULT now(),
  "duration_ms" integer NOT NULL,
  "status" text NOT NULL CHECK (status IN ('ok','error')),
  "error" text,
  "results" jsonb NOT NULL
);
CREATE INDEX IF NOT EXISTS "scan_results_url_idx" ON "scan_results" ("url");

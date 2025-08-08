
# Supabase Schema Reference

## Current Database Tables

Based on the actual database structure, here are the tables and their exact columns:

## analysis_cache
• **id** (uuid PK) – auto‑generated via `uuid_generate_v4()`  
• **url_hash** (text) – unique SHA‑256 or similar hash of URL  
• **original_url** (text) – the raw URL that was analyzed  
• **created_at** (timestamp without time zone) – when the cache entry was created  
• **expires_at** (timestamp without time zone) – when the cache entry expires  
• **audit_json** (jsonb) – stored Lighthouse/Playwright analysis results

## scan_status
• **scan_id** (uuid) – FK → `scans.id`, cascade on delete  
• **status** (text) – one of `queued`, `running`, `complete`, `failed`  
• **progress** (smallint) – percent complete (0–100)  
• **started_at** (timestamp without time zone) – when the scan was started  
• **finished_at** (timestamp without time zone) – when the scan completed  
• **error** (text) – error message if failed  
• **id** (uuid PK) – auto‑generated primary key  
• **created_at** (timestamp without time zone) – record creation timestamp  
• **updated_at** (timestamp without time zone) – last update timestamp

## scans
• **id** (uuid PK) – auto‑generated via `uuid_generate_v4()`
• **user_id** (uuid) – FK → `auth.users.id`, nullable for anonymous scans
• **url** (text) – the URL to be scanned
• **created_at** (timestamp without time zone) – when the scan was requested
• **last_run_at** (timestamp without time zone) – timestamp of last scan execution
• **active** (boolean) – whether the scan is active (soft‑delete flag)

### scan_tasks
• **task_id** (uuid PK) – unique ID for each sub-task  
• **scan_id** (uuid FK → scans.id) – parent scan reference  
• **type** (text) – one of `tech`, `colors`, `seo`, `perf`  
• **status** (text) – `queued`|`running`|`complete`|`failed`  
• **payload** (jsonb) – parameters or result metadata  
• **created_at** (timestamptz) – default `now()`

## Additional Tables
The database also contains these tables:
• **scan_tasks** – Individual task breakdown for each scan type
• **users** – User management (likely from Supabase Auth)

## Database Connection
- **Environment Variables Required:**
  - `VITE_SUPABASE_URL` - Your Supabase project URL
  - `SUPABASE_SERVICE_ROLE_KEY` - Service role key for server-side operations
  - `DATABASE_URL` - Direct PostgreSQL connection string

## Row Level Security (RLS)
- Enable Realtime broadcasts on `scan_status` for live progress updates
- Set RLS policies: users can `SELECT`/`INSERT`/`UPDATE` their own `scans` and `scan_status`
- `analysis_cache` should be public read-only for performance optimization

## Data Types Notes
- All timestamps use `timestamp without time zone` (not `timestamptz`)
- UUIDs are used for all primary keys and foreign keys
- JSONB is used for storing complex analysis results in `analysis_cache`
- Boolean fields use PostgreSQL's native boolean type

## Verification

```bash
npm run migrate:supabase
npm run generate:migration
npx tsx clear-supabase.ts
psql "$DATABASE_URL" -c \
  "SELECT table_name FROM information_schema.tables \
   WHERE table_schema='public' AND table_name IN ('scans','scan_status','analysis_cache','scan_tasks','users');"
```

# Supabase Schema Reference

## scans
• **id** (uuid PK) – auto‑generated via `uuid_generate_v4()`  
• **user_id** (uuid) – FK → `auth.users.id`, nullable for anonymous  
• **url** (text) – unique canonical URL  
• **created_at** (timestamptz) – default `now()`  
• **last_run_at** (timestamptz) – timestamp of last audit  
• **active** (boolean) – default `true` (soft‑delete)

## scan_status
• **scan_id** (uuid PK) – FK → `scans.id`, cascade on delete  
• **status** (text) – one of `queued`, `running`, `complete`, `failed`  
• **progress** (smallint) – percent complete (0–100)  
• **started_at**, **finished_at** (timestamptz)  
• **error** (text) – error message if failed

## analysis_cache
• **id** (uuid PK) – auto‑generated  
• **url_hash** (text) – unique SHA‑256 or similar hash of URL  
• **original_url** (text) – the raw URL  
• **created_at**, **expires_at** (timestamptz)  
• **audit_json** (jsonb) – stored Lighthouse/Playwright result

**Realtime & Policies:**
- Enable Realtime broadcasts on `scan_status` for live updates.  
- Set RLS: users can `SELECT`/`INSERT`/`UPDATE` their own `scans` and `scan_status`; `analysis_cache` is public read-only.

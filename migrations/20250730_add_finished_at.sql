ALTER TABLE IF NOT EXISTS public.scan_status
  ADD COLUMN IF NOT EXISTS finished_at timestamp;

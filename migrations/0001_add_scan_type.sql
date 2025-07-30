ALTER TABLE public.analysis_cache ADD COLUMN scan_id uuid NOT NULL;
ALTER TABLE public.analysis_cache ADD COLUMN type text NOT NULL;
CREATE INDEX IF NOT EXISTS analysis_cache_scan_type_idx ON public.analysis_cache (type, url_hash);

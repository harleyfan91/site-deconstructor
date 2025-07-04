import { createClient } from '@supabase/supabase-js';

// Note: Environment variables seem to be mixed up in the secrets
const url = import.meta.env.VITE_SUPABASE_SERVICE_ROLE_KEY!; // This contains the URL
const key = import.meta.env.VITE_SUPABASE_ANON_KEY!; // This contains the anon key

export const supabase = createClient(url, key);
import { createClient } from '@supabase/supabase-js';

// Fixed: Environment variables were incorrectly mapped
// The URL is in SUPABASE_SERVICE_ROLE_KEY and we need the anon key for client-side usage
const supabaseUrl = 'https://sxrhpwmdslxgwpqfdmxu.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'placeholder-key';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
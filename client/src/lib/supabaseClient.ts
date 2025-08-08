import { createClient } from '@supabase/supabase-js';

// Client-side Supabase configuration using hard-coded credentials
const supabaseUrl = 'https://kdkuhrbaftksknfgjcch.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imtka3VocmJhZnRrc2tuZmdqY2NoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQ2NTU5NzIsImV4cCI6MjA3MDIzMTk3Mn0.IdNH8dTjjyKtbdqiO-cDPo1ecOGaeFRTtiTJkSRZG78';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
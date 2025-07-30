import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL!;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

// Use service role to bypass RLS
const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function clearSupabase() {
  console.log('🧹 Clearing Supabase database (only existing tables)...');

  try {
    // Delete all from analysis_cache (this worked before)
    const { count: cacheCount, error: cacheError } = await supabase
      .from('analysis_cache')
      .delete({ count: 'exact' })
      .gt('created_at', '1900-01-01');

    if (cacheError) throw cacheError;
    console.log(`🗑️ Deleted ${cacheCount} analysis_cache records`);

    console.log('✅ Supabase database cleared successfully!');
    console.log('Note: Only analysis_cache table exists and was cleared.');

  } catch (error) {
    console.error('❌ Error clearing Supabase:', error);
  }

  process.exit(0);
}

clearSupabase();

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
    // Clear analysis_cache
    const { count: cacheCount, error: cacheError } = await supabase
      .from('analysis_cache')
      .delete({ count: 'exact' })
      .neq('id', '00000000-0000-0000-0000-000000000000'); // Delete all records

    if (cacheError) throw cacheError;
    console.log(`🗑️ Deleted ${cacheCount || 0} analysis_cache records`);

    // Clear scan_status  
    const { count: statusCount, error: statusError } = await supabase
      .from('scan_status')
      .delete({ count: 'exact' })
      .neq('id', '00000000-0000-0000-0000-000000000000'); // Delete all records

    if (statusError) throw statusError;
    console.log(`🗑️ Deleted ${statusCount || 0} scan_status records`);

    // Clear scans
    const { count: scansCount, error: scansError } = await supabase
      .from('scans')
      .delete({ count: 'exact' })
      .neq('id', '00000000-0000-0000-0000-000000000000'); // Delete all records

    if (scansError) throw scansError;
    console.log(`🗑️ Deleted ${scansCount || 0} scans records`);

    console.log('✅ Supabase database cleared successfully!');

  } catch (error) {
    console.error('❌ Error clearing Supabase:', error);
  }

  process.exit(0);
}

clearSupabase();

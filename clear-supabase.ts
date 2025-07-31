

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
    // Clear analysis_cache - delete all records without column filters
    const { count: cacheCount, error: cacheError } = await supabase
      .from('analysis_cache')
      .delete({ count: 'exact' })
      .gte('created_at', '1900-01-01'); // Use a filter that works with timestamp columns

    if (cacheError) {
      console.log('Trying alternative method for analysis_cache...');
      // If timestamp filter fails, try without any filter (delete all)
      const { count: cacheCount2, error: cacheError2 } = await supabase
        .from('analysis_cache')
        .delete({ count: 'exact' })
        .not('url_hash', 'is', null); // This should match all records since url_hash is required

      if (cacheError2) throw cacheError2;
      console.log(`🗑️ Deleted ${cacheCount2 || 0} analysis_cache records`);
    } else {
      console.log(`🗑️ Deleted ${cacheCount || 0} analysis_cache records`);
    }

    // Clear scan_status - try different approaches based on actual columns
    try {
      const { count: statusCount, error: statusError } = await supabase
        .from('scan_status')
        .delete({ count: 'exact' })
        .not('scan_id', 'is', null); // Use scan_id since it's a required FK

      if (statusError) throw statusError;
      console.log(`🗑️ Deleted ${statusCount || 0} scan_status records`);
    } catch (statusErr) {
      console.log('Alternative scan_status clear attempt...');
      const { count: statusCount2, error: statusError2 } = await supabase
        .from('scan_status')
        .delete({ count: 'exact' })
        .gte('started_at', '1900-01-01'); // Try started_at instead

      if (statusError2) throw statusError2;
      console.log(`🗑️ Deleted ${statusCount2 || 0} scan_status records`);
    }

    // Clear scans - try different approaches based on actual columns
    try {
      const { count: scansCount, error: scansError } = await supabase
        .from('scans')
        .delete({ count: 'exact' })
        .gte('created_at', '1900-01-01');

      if (scansError) {
        console.log('Alternative scans clear attempt...');
        const { count: scansCount2, error: scansError2 } = await supabase
          .from('scans')
          .delete({ count: 'exact' })
          .not('url', 'is', null); // Use url since it's required

        if (scansError2) throw scansError2;
        console.log(`🗑️ Deleted ${scansCount2 || 0} scans records`);
      } else {
        console.log(`🗑️ Deleted ${scansCount || 0} scans records`);
      }
    } catch (scansErr) {
      console.error('Failed to clear scans table:', scansErr);
    }

    console.log('✅ Supabase database cleared successfully!');

  } catch (error) {
    console.error('❌ Error clearing Supabase:', error);
  }

  process.exit(0);
}

clearSupabase();

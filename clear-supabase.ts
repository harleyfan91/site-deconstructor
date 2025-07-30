
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
  console.log('🧹 Clearing Supabase database with service role...');
  
  try {
    // Delete all from analysis_cache (use gt filter to match all)
    const { count: cacheCount, error: cacheError } = await supabase
      .from('analysis_cache')
      .delete({ count: 'exact' })
      .gt('created_at', '1900-01-01');
    
    if (cacheError) throw cacheError;
    console.log(`🗑️ Deleted ${cacheCount} analysis_cache records`);
    
    // Delete all from scan_tasks
    const { count: tasksCount, error: tasksError } = await supabase
      .from('scan_tasks')
      .delete({ count: 'exact' })
      .gt('created_at', '1900-01-01');
    
    if (tasksError) throw tasksError;
    console.log(`🗑️ Deleted ${tasksCount} scan_tasks records`);
    
    // Delete all from scan_status
    const { count: statusCount, error: statusError } = await supabase
      .from('scan_status')
      .delete({ count: 'exact' })
      .gt('progress', -1);
    
    if (statusError) throw statusError;
    console.log(`🗑️ Deleted ${statusCount} scan_status records`);
    
    // Delete all from scans
    const { count: scansCount, error: scansError } = await supabase
      .from('scans')
      .delete({ count: 'exact' })
      .gt('created_at', '1900-01-01');
    
    if (scansError) throw scansError;
    console.log(`🗑️ Deleted ${scansCount} scans records`);
    
    console.log('✅ Supabase database cleared successfully!');
    
  } catch (error) {
    console.error('❌ Error clearing Supabase:', error);
  }
  
  process.exit(0);
}

clearSupabase();

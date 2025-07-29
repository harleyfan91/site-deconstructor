#!/usr/bin/env node

/**
 * Export data from current database to Supabase using Supabase client
 */

import { createClient } from '@supabase/supabase-js';
import { db } from '../server/db.js';

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Supabase credentials not found');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function exportData() {
  try {
    console.log('🔄 Exporting data to Supabase...');

    // Get current data from Neon database
    const scansResult = await db.execute('SELECT * FROM scans');
    const scanStatusResult = await db.execute('SELECT * FROM scan_status');  
    const scanTasksResult = await db.execute('SELECT * FROM scan_tasks');
    const analysisCacheResult = await db.execute('SELECT * FROM analysis_cache');

    console.log(`📊 Found data: ${scansResult.rows.length} scans, ${scanStatusResult.rows.length} statuses, ${scanTasksResult.rows.length} tasks, ${analysisCacheResult.rows.length} cache entries`);

    // Clear existing data in Supabase
    await supabase.from('scan_tasks').delete().neq('task_id', '00000000-0000-0000-0000-000000000000');
    await supabase.from('scan_status').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    await supabase.from('analysis_cache').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    await supabase.from('scans').delete().neq('id', '00000000-0000-0000-0000-000000000000');

    // Export scans
    const scansData = scansResult.rows.map(row => ({
      id: row.id,
      url: row.url,
      created_at: row.created_at,
      user_id: row.user_id || null
    }));

    if (scansData.length > 0) {
      const { error: scansError } = await supabase.from('scans').insert(scansData);
      if (scansError) {
        console.error('Error inserting scans:', scansError);
      } else {
        console.log(`✅ Exported ${scansData.length} scans`);
      }
    }

    // Export scan_status
    const statusData = scanStatusResult.rows.map(row => ({
      id: row.id,
      scan_id: row.scan_id,
      status: row.status,
      progress: row.progress,
      created_at: row.created_at,
      updated_at: row.updated_at
    }));

    if (statusData.length > 0) {
      const { error: statusError } = await supabase.from('scan_status').insert(statusData);
      if (statusError) {
        console.error('Error inserting scan_status:', statusError);
      } else {
        console.log(`✅ Exported ${statusData.length} scan statuses`);
      }
    }

    // Export scan_tasks
    const tasksData = scanTasksResult.rows.map(row => ({
      task_id: row.task_id,
      scan_id: row.scan_id,
      type: row.type,
      status: row.status,
      created_at: row.created_at,
      result: row.result
    }));

    if (tasksData.length > 0) {
      const { error: tasksError } = await supabase.from('scan_tasks').insert(tasksData);
      if (tasksError) {
        console.error('Error inserting scan_tasks:', tasksError);
      } else {
        console.log(`✅ Exported ${tasksData.length} scan tasks`);
      }
    }

    // Export analysis_cache
    const cacheData = analysisCacheResult.rows.map(row => ({
      id: row.id,
      url_hash: row.url_hash,
      original_url: row.original_url,
      created_at: row.created_at,
      expires_at: row.expires_at,
      audit_json: row.audit_json
    }));

    if (cacheData.length > 0) {
      const { error: cacheError } = await supabase.from('analysis_cache').insert(cacheData);
      if (cacheError) {
        console.error('Error inserting analysis_cache:', cacheError);
      } else {
        console.log(`✅ Exported ${cacheData.length} cache entries`);
      }
    }

    // Verify export
    const { data: supabaseScans, error } = await supabase.from('scans').select('*');
    if (error) {
      console.error('Verification error:', error);
    } else {
      console.log(`🔍 Verification: ${supabaseScans.length} scans now in Supabase`);
    }

    console.log('✅ Export completed successfully!');

  } catch (error) {
    console.error('❌ Export failed:', error);
  }
}

exportData();
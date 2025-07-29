#!/usr/bin/env node

/**
 * Migration script to copy data from Neon database to Supabase
 * This script reads from the current Neon database and writes to Supabase
 */

import { Pool, neonConfig } from '@neondatabase/serverless';
import { drizzle as neonDrizzle } from 'drizzle-orm/neon-serverless';
import { createClient } from '@supabase/supabase-js';
import ws from "ws";

neonConfig.webSocketConstructor = ws;

// Source: Neon database (current)
const neonPool = new Pool({ connectionString: process.env.DATABASE_URL });
const neonDb = neonDrizzle({ client: neonPool });

// Destination: Supabase database
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function migrateTables() {
  try {
    console.log('🔄 Starting migration from Neon to Supabase...');

    // Get data from Neon
    const scansData = await neonDb.execute('SELECT * FROM scans ORDER BY created_at');
    const scanStatusData = await neonDb.execute('SELECT * FROM scan_status ORDER BY created_at');
    const scanTasksData = await neonDb.execute('SELECT * FROM scan_tasks ORDER BY created_at');
    const analysisCacheData = await neonDb.execute('SELECT * FROM analysis_cache ORDER BY created_at');

    console.log(`📊 Found data: ${scansData.rows.length} scans, ${scanStatusData.rows.length} statuses, ${scanTasksData.rows.length} tasks, ${analysisCacheData.rows.length} cache entries`);

    // Migrate scans
    for (const scan of scansData.rows) {
      const { error } = await supabase.from('scans').insert({
        id: scan.id,
        url: scan.url,
        created_at: scan.created_at,
        user_id: scan.user_id
      });
      if (error) console.error('Error inserting scan:', error);
    }

    // Migrate scan_status
    for (const status of scanStatusData.rows) {
      const { error } = await supabase.from('scan_status').insert({
        id: status.id,
        scan_id: status.scan_id,
        status: status.status,
        progress: status.progress,
        created_at: status.created_at,
        updated_at: status.updated_at
      });
      if (error) console.error('Error inserting scan_status:', error);
    }

    // Migrate scan_tasks
    for (const task of scanTasksData.rows) {
      const { error } = await supabase.from('scan_tasks').insert({
        task_id: task.task_id,
        scan_id: task.scan_id,
        type: task.type,
        status: task.status,
        created_at: task.created_at,
        result: task.result
      });
      if (error) console.error('Error inserting scan_task:', error);
    }

    // Migrate analysis_cache
    for (const cache of analysisCacheData.rows) {
      const { error } = await supabase.from('analysis_cache').insert({
        id: cache.id,
        url_hash: cache.url_hash,
        original_url: cache.original_url,
        created_at: cache.created_at,
        expires_at: cache.expires_at,
        audit_json: cache.audit_json
      });
      if (error) console.error('Error inserting analysis_cache:', error);
    }

    console.log('✅ Migration completed successfully!');
    
    // Verify migration
    const { data: supabaseScans } = await supabase.from('scans').select('count');
    console.log(`🔍 Verification: ${supabaseScans.length} scans now in Supabase`);

  } catch (error) {
    console.error('❌ Migration failed:', error);
  } finally {
    await neonPool.end();
  }
}

migrateTables();
import { createClient } from '@supabase/supabase-js';

// Server-side Supabase client with service role key for elevated permissions
// Note: Environment variables seem to be mixed up in the secrets
const supabaseUrl = process.env.SUPABASE_SERVICE_ROLE_KEY!; // This contains the URL
const serviceRoleKey = process.env.VITE_SUPABASE_URL!; // This contains the service role key

if (!supabaseUrl || !serviceRoleKey) {
  throw new Error('Missing Supabase environment variables: VITE_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are required');
}

export const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

// Database table interface for analysis cache (matching actual table structure)
export interface AnalysisCacheRow {
  id: string;
  url_hash: string;
  original_url: string;
  analysis_data: any;
  created_at: string;
  expires_at: string;
}

// Cache operations
export class SupabaseCacheService {
  private static readonly TABLE_NAME = 'analysis_cache';
  private static readonly CACHE_TTL_HOURS = 24;

  static async get(urlHash: string): Promise<AnalysisCacheRow | null> {
    try {
      // Simple cache lookup without time-based filtering since the table structure is minimal
      const { data, error } = await supabase
        .from(this.TABLE_NAME)
        .select('*')
        .eq('url_hash', urlHash)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          // No rows found
          return null;
        }
        console.error('Supabase cache get error:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Cache get error:', error);
      return null;
    }
  }

  static async set(urlHash: string, url: string, analysisData: any): Promise<boolean> {
    try {
      // Match the exact table structure from the screenshot: url_hash, original_url, analysis_data
      const { error } = await supabase
        .from(this.TABLE_NAME)
        .upsert({
          url_hash: urlHash,
          original_url: url,
          analysis_data: analysisData
        }, {
          onConflict: 'url_hash'
        });

      if (error) {
        console.error('Supabase cache set error:', error);
        return false;
      }

      console.log(`✅ Cached analysis for ${url} in Supabase`);
      return true;
    } catch (error) {
      console.error('Cache set error:', error);
      return false;
    }
  }

  static async createTableIfNotExists(): Promise<void> {
    try {
      // Test if table exists by trying to select from it with proper error handling
      const { error: testError } = await supabase
        .from(this.TABLE_NAME)
        .select('url_hash')
        .limit(1);

      if (!testError) {
        console.log(`✅ Table ${this.TABLE_NAME} exists and is accessible`);
        return;
      }

      // Log the actual error for debugging
      console.log(`❌ Table access error:`, testError.code, testError.message);
      
      // Common RLS permission error
      if (testError.code === 'PGRST301' || testError.message.includes('permission denied')) {
        console.log(`🔒 RLS permission issue detected. Table exists but service role needs policy access.`);
        console.log(`📝 Run this SQL to fix permissions:`);
        console.log(`-- Disable RLS temporarily or create proper policy
ALTER TABLE analysis_cache DISABLE ROW LEVEL SECURITY;
-- OR create a service role policy:
-- CREATE POLICY "service_role_access" ON analysis_cache FOR ALL TO service_role USING (true);`);
        return;
      }

      // Table doesn't exist
      if (testError.code === 'PGRST106' || testError.message.includes('does not exist')) {
        console.log(`🔧 Table ${this.TABLE_NAME} needs to be created`);
        console.log(`📝 Please run this SQL in your Supabase SQL editor:`);
        console.log(`-- Create table matching your existing structure
CREATE TABLE IF NOT EXISTS analysis_cache (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  url_hash VARCHAR(64) UNIQUE NOT NULL,
  original_url TEXT,
  analysis_data JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_analysis_cache_url_hash ON analysis_cache(url_hash);
ALTER TABLE analysis_cache DISABLE ROW LEVEL SECURITY;`);
      }
      
    } catch (error) {
      console.error('Error checking table:', error);
    }
  }
}
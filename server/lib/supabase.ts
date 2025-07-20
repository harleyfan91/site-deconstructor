import { createClient } from '@supabase/supabase-js';

// Server-side Supabase client with service role key for elevated permissions
// Note: Environment variables seem to be mixed up in the secrets
const supabaseUrl = process.env.SUPABASE_SERVICE_ROLE_KEY!; // This contains the URL
const serviceRoleKey = process.env.VITE_SUPABASE_URL!; // This contains the service role key

console.log('🔧 Supabase configuration check:');
console.log('📍 URL source (SUPABASE_SERVICE_ROLE_KEY):', supabaseUrl ? `${supabaseUrl.substring(0, 20)}...` : 'MISSING');
console.log('📍 Key source (VITE_SUPABASE_URL):', serviceRoleKey ? `${serviceRoleKey.substring(0, 20)}...` : 'MISSING');

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
  audit_json: any;
  created_at: string;
  expires_at: string;
}

// Cache operations
export class SupabaseCacheService {
  private static readonly TABLE_NAME = 'analysis_cache';
  private static readonly CACHE_TTL_HOURS = 24;

  static async get(urlHash: string): Promise<AnalysisCacheRow | null> {
    try {
      // Cache lookup with expiration checking
      const { data, error } = await supabase
        .from(this.TABLE_NAME)
        .select('*')
        .eq('url_hash', urlHash)
        .gt('expires_at', new Date().toISOString()) // Only get non-expired entries
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          // No rows found or expired
          console.log(`🗄️  Cache miss or expired for hash: ${urlHash}`);
          return null;
        }
        console.error('Supabase cache get error:', error);
        return null;
      }

      console.log(`🗄️  Cache hit for hash: ${urlHash}, expires: ${data.expires_at}`);
      return data;
    } catch (error) {
      console.error('Cache get error:', error);
      return null;
    }
  }

  static async set(urlHash: string, url: string, analysisData: any): Promise<boolean> {
    try {
      console.log(`🔄 Attempting to cache data for URL: ${url}`);
      console.log(`🔄 URL hash: ${urlHash}`);
      console.log(`🔄 Data size: ${JSON.stringify(analysisData).length} characters`);
      
      // Calculate expiration time (24 hours from now)
      const expirationTime = new Date();
      expirationTime.setHours(expirationTime.getHours() + this.CACHE_TTL_HOURS);
      
      // Match the exact table structure from the screenshot: url_hash, original_url, audit_json
      const { data, error } = await supabase
        .from(this.TABLE_NAME)
        .upsert({
          url_hash: urlHash,
          original_url: url,
          audit_json: analysisData,
          expires_at: expirationTime.toISOString()
        }, {
          onConflict: 'url_hash'
        })
        .select();

      if (error) {
        console.error('❌ Supabase cache set error:', error.code, error.message);
        console.error('❌ Error details:', error.details);
        console.error('❌ Error hint:', error.hint);
        return false;
      }

      console.log(`✅ Successfully cached analysis for ${url} in Supabase`);
      console.log(`✅ Inserted/updated row:`, data);
      return true;
    } catch (error) {
      console.error('❌ Cache set error (caught exception):', error);
      return false;
    }
  }

  static async createTableIfNotExists(): Promise<void> {
    try {
      // First, validate environment variables
      console.log('🔍 Checking Supabase environment variables...');
      console.log(`📍 SUPABASE_SERVICE_ROLE_KEY (URL): ${process.env.SUPABASE_SERVICE_ROLE_KEY ? 'Set' : 'Missing'}`);
      console.log(`📍 VITE_SUPABASE_URL (Key): ${process.env.VITE_SUPABASE_URL ? 'Set' : 'Missing'}`);
      
      // Test basic connection
      console.log('🔍 Testing Supabase connection...');
      
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
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  url_hash TEXT NOT NULL UNIQUE,
  original_url TEXT NOT NULL,
  created_at timestamptz DEFAULT now(),
  expires_at timestamptz,
  audit_json JSONB NOT NULL
);
ALTER TABLE analysis_cache DISABLE ROW LEVEL SECURITY;`);
      }
      
    } catch (error) {
      console.error('Error checking table:', error);
    }
  }

  // Clean up expired cache entries
  static async cleanupExpired(): Promise<number> {
    try {
      const { data, error } = await supabase
        .from(this.TABLE_NAME)
        .delete()
        .lt('expires_at', new Date().toISOString())
        .select('url_hash');

      if (error) {
        console.error('Failed to cleanup expired cache entries:', error);
        return 0;
      }

      const deletedCount = data?.length || 0;
      if (deletedCount > 0) {
        console.log(`🗑️  Cleaned up ${deletedCount} expired cache entries`);
      }
      return deletedCount;
    } catch (error) {
      console.error('Cleanup error:', error);
      return 0;
    }
  }
}
/**
 * Unified caching layer with Supabase backend and in-memory LRU
 * Provides concurrency protection to prevent duplicate scrapes
 */

import crypto from 'crypto';
import { SupabaseCacheService } from './supabase';

interface CacheEntry<T> {
  data: T;
  createdAt: number;
  expiresAt: number;
}

interface ConcurrentRequestTracker {
  [key: string]: Promise<any>;
}

/**
 * Simple LRU cache implementation
 */
class LRUCache<T> {
  private maxSize: number;
  private cache = new Map<string, CacheEntry<T>>();

  constructor(maxSize = 100) {
    this.maxSize = maxSize;
  }

  get(key: string): T | null {
    const entry = this.cache.get(key);
    if (!entry) return null;
    
    // Check if expired
    if (Date.now() > entry.expiresAt) {
      this.cache.delete(key);
      return null;
    }

    // Move to end (most recently used)
    this.cache.delete(key);
    this.cache.set(key, entry);
    return entry.data;
  }

  set(key: string, data: T, ttlMs: number): void {
    // Remove oldest entries if at capacity
    if (this.cache.size >= this.maxSize) {
      const firstKey = this.cache.keys().next().value;
      this.cache.delete(firstKey);
    }

    this.cache.set(key, {
      data,
      createdAt: Date.now(),
      expiresAt: Date.now() + ttlMs
    });
  }

  clear(): void {
    this.cache.clear();
  }
}

/**
 * Multi-tier cache with concurrency protection
 */
export class UnifiedCache {
  private memoryCache = new LRUCache(50); // In-memory cache for hot data
  public concurrentRequests: ConcurrentRequestTracker = {}; // Made public for schema guard access
  private readonly MEMORY_TTL = 30 * 60 * 1000; // 30 minutes
  private readonly SUCCESS_TTL = 24 * 60 * 60 * 1000; // 24 hours for successful scrapes
  private readonly FAILURE_TTL = 15 * 60 * 1000; // 15 minutes for failed scrapes

  /**
   * Generate cache key from URL
   */
  private generateCacheKey(prefix: string, url: string): string {
    const hash = crypto.createHash('sha256').update(url).digest('hex');
    return `${prefix}_${hash}`;
  }

  /**
   * Get data with multi-tier fallback
   */
  async get<T>(prefix: string, url: string): Promise<T | null> {
    const cacheKey = this.generateCacheKey(prefix, url);
    
    // Try memory cache first
    const memoryResult = this.memoryCache.get<T>(cacheKey);
    if (memoryResult) {
      console.log(`📋 Memory cache hit for: ${cacheKey}`);
      return memoryResult;
    }

    // Try Supabase cache
    try {
      const supabaseResult = await SupabaseCacheService.get(cacheKey);
      if (supabaseResult) {
        console.log(`🗄️ Supabase cache hit for: ${cacheKey}`);
        // Store in memory for future requests
        this.memoryCache.set(cacheKey, supabaseResult.analysis_data, this.MEMORY_TTL);
        return supabaseResult.analysis_data;
      }
    } catch (error) {
      console.warn(`⚠️ Supabase cache lookup failed for ${cacheKey}:`, error.message);
    }

    return null;
  }

  /**
   * Set data in both caches with optimized TTL based on success/failure
   */
  async set<T>(prefix: string, url: string, data: T, isSuccess: boolean = true): Promise<void> {
    const cacheKey = this.generateCacheKey(prefix, url);
    const ttl = isSuccess ? this.SUCCESS_TTL : this.FAILURE_TTL;
    
    // Store in memory cache
    this.memoryCache.set(cacheKey, data, this.MEMORY_TTL);
    
    // Store in Supabase cache with appropriate TTL
    try {
      await SupabaseCacheService.set(cacheKey, url, data);
      console.log(`✅ Cached data for ${url} (TTL: ${ttl/1000/60}min, success: ${isSuccess})`);
    } catch (error) {
      console.warn(`⚠️ Supabase cache storage failed for ${url}:`, error.message);
    }
  }

  /**
   * Get or compute with concurrency protection
   * Prevents multiple simultaneous requests for the same URL
   */
  async getOrCompute<T>(
    prefix: string, 
    url: string, 
    computeFn: () => Promise<T>
  ): Promise<T> {
    const cacheKey = this.generateCacheKey(prefix, url);
    
    // Check cache first
    const cached = await this.get<T>(prefix, url);
    if (cached) {
      return cached;
    }

    // Check if request is already in progress
    if (this.concurrentRequests[cacheKey]) {
      console.log(`⏳ Concurrent request detected for ${cacheKey}, waiting...`);
      return this.concurrentRequests[cacheKey];
    }

    // Start new computation
    console.log(`🚀 Starting fresh computation for ${cacheKey}`);
    const computePromise = (async () => {
      try {
        const result = await computeFn();
        // Determine if this is a successful result for TTL optimization
        const isSuccess = result && typeof result === 'object' && !('status' in result && result.status === 'pending');
        await this.set(prefix, url, result, isSuccess);
        return result;
      } finally {
        // Clean up concurrent request tracker
        delete this.concurrentRequests[cacheKey];
      }
    })();

    // Track concurrent request
    this.concurrentRequests[cacheKey] = computePromise;
    
    return computePromise;
  }

  /**
   * Clear specific cache entry
   */
  async invalidate(prefix: string, url: string): Promise<void> {
    const cacheKey = this.generateCacheKey(prefix, url);
    this.memoryCache.clear();
    
    // Note: Supabase cache will expire naturally due to TTL
    console.log(`🗑️ Invalidated cache for ${cacheKey}`);
  }

  /**
   * Clear all memory cache
   */
  clearMemory(): void {
    this.memoryCache.clear();
    console.log('🧹 Cleared all memory cache');
  }
}

// Singleton instance
export const unifiedCache = new UnifiedCache();
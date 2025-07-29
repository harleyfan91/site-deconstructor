export async function analyzePerformance(url: string): Promise<any> {
  console.log(`⚡ Running performance analysis for: ${url}`);

  try {
    // Import Lighthouse service
    const { LighthouseService } = await import('../../server/lib/lighthouse-service.js');

    // Run Lighthouse analysis
    const report = await LighthouseService.analyzeUrl(url);

    const result = {
      lighthouse: report,
      timestamp: new Date().toISOString(),
      url
    };

    // Cache the result in Supabase
    try {
      const { SupabaseCacheService } = await import('../../server/lib/supabase.js');
      const crypto = await import('crypto');
      const urlHash = crypto.createHash('sha256').update(url).digest('hex');
      const cacheKey = `perf_${urlHash}`;

      await SupabaseCacheService.set(cacheKey, url, result);
      console.log(`✅ Performance analysis cached in Supabase for ${url}`);
    } catch (cacheError) {
      console.error('❌ Failed to cache performance analysis:', cacheError);
    }

    return result;
  } catch (error) {
    console.error('❌ Performance analysis failed:', error);
    throw error;
  }
}
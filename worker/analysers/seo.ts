export async function analyzeSEO(url: string): Promise<any> {
  console.log(`📈 Running SEO analysis for: ${url}`);

  try {
    // Import SEO extractor
    const { SEOExtractor } = await import('../../server/lib/seo-extractor.js');

    // Run SEO analysis
    const seoData = await SEOExtractor.extractSEOData(url);

    const result = {
      seo: seoData,
      timestamp: new Date().toISOString(),
      url
    };

    // Cache the result in Supabase
    try {
      const { SupabaseCacheService } = await import('../../server/lib/supabase.js');
      const crypto = await import('crypto');
      const urlHash = crypto.createHash('sha256').update(url).digest('hex');
      const cacheKey = `seo_${urlHash}`;

      await SupabaseCacheService.set(cacheKey, url, result);
      console.log(`✅ SEO analysis cached in Supabase for ${url}`);
    } catch (cacheError) {
      console.error('❌ Failed to cache SEO analysis:', cacheError);
    }

    return result;
  } catch (error) {
    console.error('❌ SEO analysis failed:', error);
    throw error;
  }
}
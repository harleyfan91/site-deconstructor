export async function analyzeColors(url: string): Promise<any> {
  console.log(`🎨 Running color analysis for: ${url}`);

  try {
    // Import color extraction service
    const { extractColors } = await import('../../server/lib/color-extraction.js');

    // Run color analysis
    const colors = await extractColors(url);

    const result = {
      colors: colors || [],
      timestamp: new Date().toISOString(),
      url
    };

    // Cache the result in Supabase
    try {
      const { SupabaseCacheService } = await import('../../server/lib/supabase.js');
      const crypto = await import('crypto');
      const urlHash = crypto.createHash('sha256').update(url).digest('hex');
      const cacheKey = `colors_${urlHash}`;

      await SupabaseCacheService.set(cacheKey, url, result);
      console.log(`✅ Colors analysis cached in Supabase for ${url}`);
    } catch (cacheError) {
      console.error('❌ Failed to cache colors analysis:', cacheError);
    }

    return result;
  } catch (error) {
    console.error('❌ Color analysis failed:', error);
    throw error;
  }
}
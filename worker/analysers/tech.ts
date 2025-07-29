export async function analyzeTech(url: string): Promise<any> {
  console.log(`🔧 Running tech analysis for: ${url}`);

  try {
    // Import tech extractor
    const { TechExtractor } = await import('../../server/lib/tech-extractor.js');

    // Run tech analysis
    const techData = await TechExtractor.extractTechnologies(url);

    const result = {
      technologies: techData,
      timestamp: new Date().toISOString(),
      url
    };

    // Cache the result in Supabase
    try {
      const { SupabaseCacheService } = await import('../../server/lib/supabase.js');
      const crypto = await import('crypto');
      const urlHash = crypto.createHash('sha256').update(url).digest('hex');
      const cacheKey = `tech_${urlHash}`;

      await SupabaseCacheService.set(cacheKey, url, result);
      console.log(`✅ Tech analysis cached in Supabase for ${url}`);
    } catch (cacheError) {
      console.error('❌ Failed to cache tech analysis:', cacheError);
    }

    return result;
  } catch (error) {
    console.error('❌ Tech analysis failed:', error);
    throw error;
  }
}
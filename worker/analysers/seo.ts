export async function analyzeSEO(url: string): Promise<any> {
  console.log(`📈 Running SEO analysis for: ${url}`);

  try {
    // Import the actual SEO extractor function
    const { extractSEOData } = await import('../../server/lib/seo-extractor.js');

    // Run SEO analysis
    const seoData = await extractSEOData(url);

    const result = {
      seo: seoData,
      timestamp: new Date().toISOString(),
      url
    };

    console.log(`✅ SEO analysis completed for ${url}`);
    return result;
  } catch (error) {
    console.error('❌ SEO analysis failed:', error);
    throw error;
  }
}
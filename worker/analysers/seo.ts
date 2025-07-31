import { normalizeUrl } from '../../shared/utils/normalizeUrl.js';

export async function analyzeSEO(url: string): Promise<any> {
  const target = normalizeUrl(url);
  console.log(`📈 Running SEO analysis for: ${target}`);

  try {
    // Import the actual SEO extractor function
    const { extractSEOData } = await import('../../server/lib/seo-extractor.js');

    // Run SEO analysis
    const seoData = await extractSEOData(target);

    const result = {
      seo: seoData,
      timestamp: new Date().toISOString(),
      url: target
    };

    console.log(`✅ SEO analysis completed for ${target}`);
    return result;
  } catch (error) {
    console.error('❌ SEO analysis failed:', error);
    throw error;
  }
}
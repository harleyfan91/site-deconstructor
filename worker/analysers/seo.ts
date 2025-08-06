import { normalizeUrl } from '../../shared/utils/normalizeUrl.js';

export async function analyzeSEO(url: string, scanId: string): Promise<any> {
  const target = normalizeUrl(url);
  console.log('🔍 seo analysing scan', scanId, 'url', target);

  try {
    // Import the actual SEO extractor function
    const { extractSEOData } = await import('../../server/lib/seo-extractor.js');

    // Run SEO analysis
    let seoData;
    try {
      seoData = await extractSEOData(target);
    } catch (err) {
      console.error('❌ extractSEOData failed', err);
      throw err;
    }

    const result = {
      seo: seoData,
      timestamp: new Date().toISOString(),
      url: target
    };

    console.log('✅ seo completed', scanId);
    return result;
  } catch (err) {
    console.error('❌ seo failed', err);
    throw err;
  }
}
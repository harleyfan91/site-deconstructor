import { normalizeUrl } from '../../shared/utils/normalizeUrl.js';

export async function analyzeTech(url: string, scanId: string): Promise<any> {
  const target = normalizeUrl(url);
  console.log('🔍 tech analysing scan', scanId, 'url', target);

  try {
    // Import the actual tech extractor function
    const { extractTechnicalData } = await import('../../server/lib/tech-extractor.js');

    // Run tech analysis
    let techData;
    try {
      techData = await extractTechnicalData(target);
    } catch (err) {
      console.error('❌ extractTechnicalData failed', err);
      throw err;
    }

    const result = {
      technologies: techData,
      timestamp: new Date().toISOString(),
      url: target
    };

    console.log('✅ tech completed', scanId);
    return result;
  } catch (err) {
    console.error('❌ tech failed', err);
    throw err;
  }
}
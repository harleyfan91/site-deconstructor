import { normalizeUrl } from '../../shared/utils/normalizeUrl.js';

export async function analyzeTech(url: string, scanId: string): Promise<any> {
  const target = normalizeUrl(url);
  console.log('🔍 tech analysing scan', scanId);

  try {
    // Import the actual tech extractor function
    const { extractTechnicalData } = await import('../../server/lib/tech-extractor.js');

    // Run tech analysis
    const techData = await extractTechnicalData(target);

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
import { normalizeUrl } from '../../shared/utils/normalizeUrl.js';

export async function analyzeColors(url: string): Promise<any> {
  const target = normalizeUrl(url);
  console.log(`🎨 Running color analysis for: ${target}`);

  try {
    // Import color extraction service
    const { extractColors } = await import('../../server/lib/color-extraction.js');

    // Run color analysis
    const colors = await extractColors(target);

    const result = {
      colors: colors || [],
      timestamp: new Date().toISOString(),
      url: target
    };


    return result;
  } catch (error) {
    console.error('❌ Color analysis failed:', error);
    throw error;
  }
}
import { normalizeUrl } from '../../shared/utils/normalizeUrl.js';

export async function analyzeColors(url: string, scanId: string): Promise<any> {
  const target = normalizeUrl(url);
  console.log('🔍 colors analysing scan', scanId, 'url', target);

  try {
    // Import color extraction service
    const { extractColors } = await import('../../server/lib/color-extraction.js');

    // Run color analysis
    let colors;
    try {
      colors = await extractColors(target);
    } catch (err) {
      console.error('❌ extractColors failed', err);
      throw err;
    }

    const result = {
      colors: colors || [],
      timestamp: new Date().toISOString(),
      url: target
    };

    console.log('✅ colors completed', scanId);
    return result;
  } catch (err) {
    console.error('❌ colors failed', err);
    throw err;
  }
}
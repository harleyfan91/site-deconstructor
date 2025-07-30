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


    return result;
  } catch (error) {
    console.error('❌ Color analysis failed:', error);
    throw error;
  }
}
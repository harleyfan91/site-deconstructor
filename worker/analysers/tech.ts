
import { normalizeUrl } from '../../shared/utils/normalizeUrl.js';

export async function analyzeTech(url: string): Promise<any> {
  const target = normalizeUrl(url);
  console.log(`🔧 Running tech analysis for: ${target}`);

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

    console.log(`✅ Tech analysis completed for ${target}`);
    return result;
  } catch (error) {
    console.error('❌ Tech analysis failed:', error);
    throw error;
  }
}
export async function analyzeTech(url: string): Promise<any> {
  console.log(`🔧 Running tech analysis for: ${url}`);

  try {
    // Import the actual tech extractor function
    const { extractTechnicalData } = await import('../../server/lib/tech-extractor.js');

    // Run tech analysis
    const techData = await extractTechnicalData(url);

    const result = {
      technologies: techData,
      timestamp: new Date().toISOString(),
      url
    };

    console.log(`✅ Tech analysis completed for ${url}`);
    return result;
  } catch (error) {
    console.error('❌ Tech analysis failed:', error);
    throw error;
  }
}
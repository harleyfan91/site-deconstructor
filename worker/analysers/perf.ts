
export async function analyzePerformance(url: string): Promise<any> {
  console.log(`⚡ Running performance analysis for: ${url}`);

  try {
    // Import the actual Lighthouse functions
    const { getLighthousePerformance, getLighthousePageLoadTime } = await import('../../server/lib/lighthouse-service.js');

    // Run Lighthouse performance analysis
    const [performanceData, pageLoadTime] = await Promise.all([
      getLighthousePerformance(url),
      getLighthousePageLoadTime(url)
    ]);

    const result = {
      performance: performanceData,
      pageLoadTime: pageLoadTime,
      timestamp: new Date().toISOString(),
      url
    };

    console.log(`✅ Performance analysis completed for ${url}`);
    return result;
  } catch (error) {
    console.error('❌ Performance analysis failed:', error);
    throw error;
  }
}

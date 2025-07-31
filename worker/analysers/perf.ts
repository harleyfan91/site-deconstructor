
import { normalizeUrl } from '../../shared/utils/normalizeUrl.js';

export async function analyzePerformance(url: string): Promise<any> {
  const target = normalizeUrl(url);
  console.log(`⚡ Running performance analysis for: ${target}`);

  try {
    // Import the actual Lighthouse functions
    const { getLighthousePerformance, getLighthousePageLoadTime } = await import('../../server/lib/lighthouse-service.js');

    // Run Lighthouse performance analysis
    const [performanceData, pageLoadTime] = await Promise.all([
      getLighthousePerformance(target),
      getLighthousePageLoadTime(target)
    ]);

    const result = {
      performance: performanceData,
      pageLoadTime: pageLoadTime,
      timestamp: new Date().toISOString(),
      url: target
    };

    console.log(`✅ Performance analysis completed for ${target}`);
    return result;
  } catch (error) {
    console.error('❌ Performance analysis failed:', error);
    throw error;
  }
}

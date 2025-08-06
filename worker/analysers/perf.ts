
import { normalizeUrl } from '../../shared/utils/normalizeUrl.js';

export async function analyzePerformance(url: string, scanId: string): Promise<any> {
  const target = normalizeUrl(url);
  console.log('🔍 perf analysing scan', scanId);

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

    console.log('✅ perf completed', scanId);
    return result;
  } catch (err) {
    console.error('❌ perf failed', err);
    throw err;
  }
}

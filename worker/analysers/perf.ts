
import { normalizeUrl } from '../../shared/utils/normalizeUrl.js';

export async function analyzePerformance(url: string, scanId: string): Promise<any> {
  const target = normalizeUrl(url);
  console.log('🔍 perf analysing scan', scanId, 'url', target);

  try {
    // Import the actual Lighthouse functions
    const { getLighthousePerformance, getLighthousePageLoadTime } = await import('../../server/lib/lighthouse-service.js');

    // Run Lighthouse performance analysis
    let performanceData, pageLoadTime;
    try {
      performanceData = await getLighthousePerformance(target);
    } catch (err) {
      console.error('❌ getLighthousePerformance failed', err);
      throw err;
    }
    try {
      pageLoadTime = await getLighthousePageLoadTime(target);
    } catch (err) {
      console.error('❌ getLighthousePageLoadTime failed', err);
      throw err;
    }

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

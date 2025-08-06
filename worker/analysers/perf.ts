
import { normalizeUrl } from '../../shared/utils/normalizeUrl.js';
import { sql } from '../../server/db.js';

async function hashUrl(url: string): Promise<string> {
  const { createHash } = await import('crypto');
  return createHash('sha256').update(url).digest('hex');
}

export async function analyzePerformance(url: string, scanId: string): Promise<void> {
  const target = normalizeUrl(url);
  console.log('🔍 analysing perf for', scanId);

  try {
    const { getLighthousePerformance, getLighthousePageLoadTime } = await import('../../server/lib/lighthouse-service.js');

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

    const urlHash = await hashUrl(`${target}:perf`);
    const audit = { performance: performanceData, pageLoadTime };
    await sql/*sql*/`
      insert into public.analysis_cache (scan_id, type, url_hash, original_url, audit_json)
      values (${scanId}, 'perf', ${urlHash}, ${target}, ${sql.json(audit)})
      on conflict (url_hash) do update set audit_json = excluded.audit_json`;
    console.log('✅ perf analysis saved for', scanId);
  } catch (err) {
    console.error('❌ perf failed', err);
    throw err;
  }
}

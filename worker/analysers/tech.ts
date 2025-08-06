import { normalizeUrl } from '../../shared/utils/normalizeUrl.js';
import { sql } from '../../server/db.js';

async function hashUrl(url: string): Promise<string> {
  const { createHash } = await import('crypto');
  return createHash('sha256').update(url).digest('hex');
}

export async function analyzeTech(url: string, scanId: string): Promise<void> {
  const target = normalizeUrl(url);
  console.log('🔍 analysing tech for', scanId);

  try {
    const { extractTechnicalData } = await import('../../server/lib/tech-extractor.js');

    let techData;
    try {
      techData = await extractTechnicalData(target);
    } catch (err) {
      console.error('❌ extractTechnicalData failed', err);
      throw err;
    }

    const urlHash = await hashUrl(`${target}:tech`);
    await sql/*sql*/`
      insert into public.analysis_cache (scan_id, type, url_hash, original_url, audit_json)
      values (${scanId}, 'tech', ${urlHash}, ${target}, ${sql.json(techData)})
      on conflict (url_hash) do update set audit_json = excluded.audit_json`;
    console.log('✅ tech analysis saved for', scanId);
  } catch (err) {
    console.error('❌ tech failed', err);
    throw err;
  }
}
import { normalizeUrl } from '../../shared/utils/normalizeUrl.js';
import { sql } from '../../server/db.js';

async function hashUrl(url: string): Promise<string> {
  const { createHash } = await import('crypto');
  return createHash('sha256').update(url).digest('hex');
}

export async function analyzeSEO(url: string, scanId: string): Promise<void> {
  const target = normalizeUrl(url);
  console.log('🔍 analysing seo for', scanId);

  try {
    const { extractSEOData } = await import('../../server/lib/seo-extractor.js');

    let seoData;
    try {
      seoData = await extractSEOData(target);
    } catch (err) {
      console.error('❌ extractSEOData failed', err);
      throw err;
    }

    const urlHash = await hashUrl(`${target}:seo`);
    await sql/*sql*/`
      insert into public.analysis_cache (scan_id, type, url_hash, original_url, audit_json)
      values (${scanId}, 'seo', ${urlHash}, ${target}, ${sql.json(seoData)})
      on conflict (url_hash) do update set audit_json = excluded.audit_json`;
    console.log('✅ seo analysis saved for', scanId);
  } catch (err) {
    console.error('❌ seo failed', err);
    throw err;
  }
}
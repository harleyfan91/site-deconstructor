import { normalizeUrl } from '../../shared/utils/normalizeUrl.js';
import { sql } from '../../server/db.js';

async function hashUrl(url: string): Promise<string> {
  const { createHash } = await import('crypto');
  return createHash('sha256').update(url).digest('hex');
}

export async function analyzeColors(url: string, scanId: string): Promise<void> {
  const target = normalizeUrl(url);
  console.log('🔍 analysing colors for', scanId);

  try {
    const { extractColors } = await import('../../server/lib/color-extraction.js');

    let colors;
    try {
      colors = await extractColors(target);
    } catch (err) {
      console.error('❌ extractColors failed', err);
      throw err;
    }

    const urlHash = await hashUrl(`${target}:colors`);
    await sql/*sql*/`
      insert into public.analysis_cache (scan_id, type, url_hash, original_url, audit_json)
      values (${scanId}, 'colors', ${urlHash}, ${target}, ${sql.json(colors || [])})
      on conflict (url_hash) do update set audit_json = excluded.audit_json`;
    console.log('✅ colors analysis saved for', scanId);
  } catch (err) {
    console.error('❌ colors failed', err);
    throw err;
  }
}
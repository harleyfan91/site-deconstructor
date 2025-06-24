export function extractMetaTags(html: string): Record<string, string> {
  const tags: Record<string, string> = {};
  const metaRegex = /<meta[^>]+(name|property)=["']([^"']+)["'][^>]*content=["']([^"']+)["'][^>]*>/gi;
  let m: RegExpExecArray | null;
  while ((m = metaRegex.exec(html)) !== null) {
    const key = m[2].toLowerCase();
    tags[key] = m[3];
  }
  const canonical = /<link[^>]+rel=["']canonical["'][^>]*href=["']([^"']+)["'][^>]*>/i.exec(html);
  if (canonical) {
    tags['canonical'] = canonical[1];
  }
  return tags;
}

export function isMobileResponsive(html: string): boolean {
  return /<meta[^>]+name=["']viewport["'][^>]*>/i.test(html);
}

function countSyllables(word: string): number {
  word = word.toLowerCase();
  if(word.length <= 3) return 1;
  const vowels = word.match(/[aeiouy]+/g);
  return vowels ? vowels.length : 1;
}

export function computeReadabilityScore(html: string): number {
  const text = html.replace(/<[^>]*>/g, ' ');
  const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
  const words = text.split(/\s+/).filter(w => w.trim().length > 0);
  const syllables = words.reduce((sum, w) => sum + countSyllables(w), 0);
  const wps = words.length / Math.max(sentences.length, 1);
  const spw = syllables / Math.max(words.length, 1);
  const score = 206.835 - 1.015 * wps - 84.6 * spw;
  return Math.max(0, Math.min(100, parseFloat(score.toFixed(2))));
}

import { SecurityHeaders } from '@/types/analysis';
export function calculateSecurityScore(headers: SecurityHeaders): number {
  let score = 0;
  if(headers.csp) score += 20;
  if(headers.hsts) score += 20;
  if(headers.xfo) score += 20;
  if(headers.xcto) score += 20;
  if(headers.referrer) score += 20;
  return score;
}

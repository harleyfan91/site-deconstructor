import { describe, it, expect } from 'vitest';
import { extractMetaTags, isMobileResponsive, computeReadabilityScore, calculateSecurityScore } from '@/lib/seo';
import { extractSecurityHeaders } from '@/lib/accessibility';

const html = `<!DOCTYPE html><html><head><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="description" content="Test page"><link rel="canonical" href="https://example.com/" /></head><body><p>Hello world.</p></body></html>`;

describe('seo utilities', () => {
  it('parses meta tags and scores', () => {
    const tags = extractMetaTags(html);
    expect(tags['description']).toBe('Test page');
    expect(tags['canonical']).toBe('https://example.com/');
    expect(isMobileResponsive(html)).toBe(true);

    const readScore = computeReadabilityScore(html);
    expect(readScore > 0 && readScore <= 100).toBe(true);
  });

  it('calculates security score from headers', () => {
    const headers = extractSecurityHeaders({
      'content-security-policy': "default-src 'self'",
      'strict-transport-security': 'max-age=63072000',
      'x-frame-options': 'DENY',
      'x-content-type-options': 'nosniff',
      'referrer-policy': 'no-referrer'
    });
    expect(calculateSecurityScore(headers)).toBe(100);
  });
});

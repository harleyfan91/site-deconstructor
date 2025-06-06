import assert from 'node:assert';
import { extractMetaTags, isMobileResponsive, computeReadabilityScore, calculateSecurityScore } from '../dist/lib/seo.js';
import { extractSecurityHeaders } from '../dist/lib/accessibility.js';

const html = `<!DOCTYPE html><html><head><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="description" content="Test page"><link rel="canonical" href="https://example.com/" /></head><body><p>Hello world.</p></body></html>`;

const tags = extractMetaTags(html);
assert.strictEqual(tags['description'], 'Test page');
assert.strictEqual(tags['canonical'], 'https://example.com/');
assert.ok(isMobileResponsive(html));

const readScore = computeReadabilityScore(html);
assert.ok(readScore > 0 && readScore <= 100);

const headers = extractSecurityHeaders({
  'content-security-policy': "default-src 'self'",
  'strict-transport-security': 'max-age=63072000',
  'x-frame-options': 'DENY',
  'x-content-type-options': 'nosniff',
  'referrer-policy': 'no-referrer'
});
assert.strictEqual(calculateSecurityScore(headers), 100);

console.log('seo utilities test passed');

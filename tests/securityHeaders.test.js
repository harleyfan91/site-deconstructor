import assert from 'node:assert';
import { extractSecurityHeaders } from '../dist/lib/accessibility.js';

const headers = {
  'content-security-policy': "default-src 'self'",
  'strict-transport-security': 'max-age=63072000',
  'x-frame-options': 'DENY',
  'x-content-type-options': 'nosniff',
  'referrer-policy': 'no-referrer'
};

const result = extractSecurityHeaders(headers);
assert.strictEqual(result.csp, headers['content-security-policy']);
assert.strictEqual(result.hsts, headers['strict-transport-security']);
assert.strictEqual(result.xfo, headers['x-frame-options']);
assert.strictEqual(result.xcto, headers['x-content-type-options']);
assert.strictEqual(result.referrer, headers['referrer-policy']);

const empty = extractSecurityHeaders({});
assert.strictEqual(empty.csp, '');
assert.strictEqual(empty.hsts, '');
console.log('security headers test passed');

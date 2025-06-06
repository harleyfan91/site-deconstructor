import assert from 'node:assert';
import * as pkg from '../dist/lib/analysisDefaults.js';
const { createDefaultAnalysis } = pkg;

const record = createDefaultAnalysis('https://example.com');
assert.strictEqual(record.coreWebVitals.lcp, 0);
assert.strictEqual(record.coreWebVitals.fid, 0);
assert.strictEqual(record.coreWebVitals.cls, 0);
assert.ok(record.securityHeaders);
assert.strictEqual(record.performanceScore, 0);
assert.strictEqual(record.seoScore, 0);
assert.strictEqual(record.readabilityScore, 0);
assert.strictEqual(record.complianceStatus, 'warn');
assert.ok(Array.isArray(record.data.ui.contrastIssues));
assert.strictEqual(record.data.performance.mobileResponsive, false);
assert.deepStrictEqual(record.data.seo.metaTags, {});
assert.strictEqual(record.data.technical.securityScore, 0);
console.log('analysisDefaults test passed');

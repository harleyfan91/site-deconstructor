import assert from 'node:assert';
import { fetchPSIData } from '../dist/lib/psi.js';
import { mockPSIResponse } from './psiSample.js';

async function mockFetch(_url) {
  return {
    ok: true,
    async json() { return mockPSIResponse; }
  };
}

const result = await fetchPSIData('https://example.com', mockFetch);
assert.strictEqual(result.coreWebVitals.lcp, 1.5);
assert.strictEqual(result.coreWebVitals.fid, 10);
assert.strictEqual(result.coreWebVitals.cls, 0.01);
assert.strictEqual(result.performanceScore, 0.9);
assert.strictEqual(result.seoScore, 0.93);
assert.strictEqual(result.readabilityScore, 0.88);

async function failFetch(_url) {
  return { ok: false, status: 500 };
}

const fallback = await fetchPSIData('https://bad.example', failFetch);
assert.strictEqual(fallback.performanceScore, 0);
assert.strictEqual(fallback.coreWebVitals.lcp, 0);
console.log('psi test passed');


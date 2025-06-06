import assert from 'node:assert';
import { analysesToCsv, analysesToJSON, parseAnalysesJSON } from '../dist/lib/export.js';
import { createDefaultAnalysis } from '../dist/lib/analysisDefaults.js';

const rec1 = createDefaultAnalysis('https://a.com');
const rec2 = createDefaultAnalysis('https://b.com');
const csv = analysesToCsv([rec1, rec2]);
assert.ok(csv.includes('https://a.com'));
assert.ok(csv.split('\n').length === 3);
const jsonStr = analysesToJSON([rec1, rec2]);
const parsed = parseAnalysesJSON(jsonStr);
assert.strictEqual(parsed.length, 2);
assert.strictEqual(parsed[0].url, 'https://a.com');
console.log('export test passed');

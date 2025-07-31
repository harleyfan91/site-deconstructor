import assert from 'node:assert';
import { analyzeAccessibility } from '../dist/lib/accessibility.js';

const goodHtml = '<html><body><img src="a.jpg" alt="ok"></body></html>';
const badHtml = '<html><body><img src="a.jpg"></body></html>';

assert.strictEqual(analyzeAccessibility(goodHtml).length, 0);
assert.ok(analyzeAccessibility(badHtml).length > 0);
console.log('accessibility test passed');

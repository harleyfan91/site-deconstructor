import assert from 'node:assert';
import { dashIfEmpty, groupByFrequency } from '../dist/lib/ui.js';

assert.strictEqual(dashIfEmpty('abc'), 'abc');
assert.strictEqual(dashIfEmpty(''), '\u2014');
assert.strictEqual(dashIfEmpty(null), '\u2014');

// frequency grouping
const sampleColors = [
  { name: 'A', hex: '#111111', usage: 'Text', count: 10 },
  { name: 'B', hex: '#222222', usage: 'Text', count: 5 },
  { name: 'C', hex: '#333333', usage: 'Text', count: 3 },
  { name: 'D', hex: '#444444', usage: 'Text', count: 1 },
];

const freqGroups = groupByFrequency(sampleColors);
assert.strictEqual(freqGroups[0].name, 'Most Used');
assert.ok(freqGroups[0].colors.length >= 3);
if (freqGroups.length > 1) {
  assert.strictEqual(freqGroups[1].name, 'Supporting Colors');
}
console.log('ui utils test passed');

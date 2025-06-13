import assert from 'node:assert';
import { groupByFrequency } from '../dist/lib/ui.js';

const colors = [
  { name: 'A', hex: '#111111', usage: 'Text', count: 8 },
  { name: 'B', hex: '#222222', usage: 'Text', count: 6 },
  { name: 'C', hex: '#333333', usage: 'Text', count: 4 },
  { name: 'D', hex: '#444444', usage: 'Text', count: 2 },
  { name: 'E', hex: '#555555', usage: 'Text', count: 1 },
];

const groups = groupByFrequency(colors);
assert.strictEqual(groups[0].name, 'Most Used');
assert.ok(groups[0].colors.length >= 3);
if (groups.length > 1) {
  assert.strictEqual(groups[1].name, 'Supporting Colors');
}
if (groups.length > 2) {
  assert.strictEqual(groups[2].name, 'Accent Colors');
}
console.log('color frequency grouping test passed');

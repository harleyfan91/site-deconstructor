import assert from 'node:assert';
import { dashIfEmpty } from '../dist/lib/ui.js';

assert.strictEqual(dashIfEmpty('abc'), 'abc');
assert.strictEqual(dashIfEmpty(''), '\u2014');
assert.strictEqual(dashIfEmpty(null), '\u2014');
console.log('ui utils test passed');

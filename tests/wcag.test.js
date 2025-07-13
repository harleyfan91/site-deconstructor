/**
 * Tests for WCAG contrast ratio utilities
 */
const assert = require('node:assert');
const { contrastRatio, passesAA, passesAAA, getRequiredRatioAA, getRequiredRatioAAA } = require('../shared/wcag.ts');

// Test contrast ratio calculations
console.log('Testing WCAG contrast ratio calculations...');

// Test black on white (should be maximum contrast ~21:1)
const blackWhiteRatio = contrastRatio('#000000', '#ffffff');
assert.ok(blackWhiteRatio > 20, `Black on white should have high contrast, got ${blackWhiteRatio}`);

// Test white on white (should be minimum contrast 1:1)
const whiteWhiteRatio = contrastRatio('#ffffff', '#ffffff');
assert.strictEqual(whiteWhiteRatio, 1, `White on white should be 1:1, got ${whiteWhiteRatio}`);

// Test a known failing combination
const failingRatio = contrastRatio('#999999', '#cccccc');
assert.ok(failingRatio < 4.5, `Gray on light gray should fail AA, got ${failingRatio}`);

// Test AA compliance checking
assert.ok(passesAA(4.5), 'Ratio of 4.5 should pass AA for normal text');
assert.ok(passesAA(3.0, true), 'Ratio of 3.0 should pass AA for large text');
assert.ok(!passesAA(3.0), 'Ratio of 3.0 should fail AA for normal text');

// Test AAA compliance checking
assert.ok(passesAAA(7.0), 'Ratio of 7.0 should pass AAA for normal text');
assert.ok(passesAAA(4.5, true), 'Ratio of 4.5 should pass AAA for large text');
assert.ok(!passesAAA(6.0), 'Ratio of 6.0 should fail AAA for normal text');

// Test required ratios
assert.strictEqual(getRequiredRatioAA(), 4.5, 'AA normal text requires 4.5:1');
assert.strictEqual(getRequiredRatioAA(true), 3.0, 'AA large text requires 3.0:1');
assert.strictEqual(getRequiredRatioAAA(), 7.0, 'AAA normal text requires 7.0:1');
assert.strictEqual(getRequiredRatioAAA(true), 4.5, 'AAA large text requires 4.5:1');

// Test RGB parsing
const rgbRatio = contrastRatio('rgb(0, 0, 0)', 'rgb(255, 255, 255)');
assert.ok(rgbRatio > 20, `RGB black on white should have high contrast, got ${rgbRatio}`);

// Test RGBA parsing (ignoring alpha)
const rgbaRatio = contrastRatio('rgba(0, 0, 0, 0.5)', 'rgba(255, 255, 255, 0.8)');
assert.ok(rgbaRatio > 20, `RGBA black on white should have high contrast, got ${rgbaRatio}`);

// Test invalid color handling
const invalidRatio = contrastRatio('invalid', 'also-invalid');
assert.strictEqual(invalidRatio, 1, 'Invalid colors should return minimum ratio of 1');

console.log('✅ All WCAG tests passed');
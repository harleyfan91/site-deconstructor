/**
 * Tests for alt text statistics helper
 */
const assert = require('node:assert');
const { getAltStats, calculateAltTextScore } = require('../shared/getAltStats.ts');

console.log('Testing alt text statistics...');

// Test with good alt text
const goodImages = [
  { alt: 'A beautiful sunset over the mountains', src: 'image1.jpg' },
  { alt: 'Company logo showing our brand values', src: 'logo.png' },
  { alt: 'Graph showing quarterly sales growth', src: 'chart.svg' }
];

const goodStats = getAltStats(goodImages);
assert.strictEqual(goodStats.totalImages, 3, 'Should count all images');
assert.strictEqual(goodStats.withAlt, 3, 'Should count images with alt text');
assert.strictEqual(goodStats.suspectAlt, 0, 'Should not flag good alt text as suspect');

const goodScore = calculateAltTextScore(goodStats);
assert.strictEqual(goodScore, 100, 'Good alt text should score 100%');

// Test with suspect alt text
const suspectImages = [
  { alt: 'image', src: 'image1.jpg' },
  { alt: 'logo', src: 'logo.png' },
  { alt: 'pic', src: 'pic.jpg' },
  { alt: '', src: 'empty.jpg' },
  { alt: 'Good descriptive alt text', src: 'good.jpg' }
];

const suspectStats = getAltStats(suspectImages);
assert.strictEqual(suspectStats.totalImages, 5, 'Should count all images');
assert.strictEqual(suspectStats.withAlt, 4, 'Should count non-empty alt text');
assert.strictEqual(suspectStats.suspectAlt, 3, 'Should flag suspect alt text');

const suspectScore = calculateAltTextScore(suspectStats);
assert.ok(suspectScore < 100, `Suspect alt text should reduce score, got ${suspectScore}`);
assert.ok(suspectScore > 0, `Score should still be positive, got ${suspectScore}`);

// Test with no images
const emptyStats = getAltStats([]);
assert.strictEqual(emptyStats.totalImages, 0, 'Should handle empty array');
assert.strictEqual(emptyStats.withAlt, 0, 'Should have no alt text');
assert.strictEqual(emptyStats.suspectAlt, 0, 'Should have no suspect alt text');

const emptyScore = calculateAltTextScore(emptyStats);
assert.strictEqual(emptyScore, 100, 'No images should score 100%');

// Test with images without alt text
const noAltImages = [
  { src: 'image1.jpg' },
  { src: 'image2.jpg' },
  { alt: undefined, src: 'image3.jpg' }
];

const noAltStats = getAltStats(noAltImages);
assert.strictEqual(noAltStats.totalImages, 3, 'Should count all images');
assert.strictEqual(noAltStats.withAlt, 0, 'Should count no alt text');
assert.strictEqual(noAltStats.suspectAlt, 0, 'Should have no suspect alt text');

const noAltScore = calculateAltTextScore(noAltStats);
assert.strictEqual(noAltScore, 0, 'No alt text should score 0%');

// Test suspect detection for filenames
const filenameImages = [
  { alt: 'image.jpg', src: 'image.jpg' },
  { alt: 'photo.png', src: 'photo.png' },
  { alt: 'Good description', src: 'good.jpg' }
];

const filenameStats = getAltStats(filenameImages);
assert.strictEqual(filenameStats.suspectAlt, 2, 'Should detect filename-like alt text');

// Test suspect detection for short/meaningless text
const shortImages = [
  { alt: 'A', src: 'short.jpg' },
  { alt: '12', src: 'numbers.jpg' },
  { alt: '   ', src: 'spaces.jpg' },
  { alt: 'Descriptive alt text', src: 'good.jpg' }
];

const shortStats = getAltStats(shortImages);
assert.strictEqual(shortStats.suspectAlt, 3, 'Should detect short/meaningless alt text');

console.log('✅ All alt stats tests passed');
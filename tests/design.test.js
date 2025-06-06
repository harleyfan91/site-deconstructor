import assert from 'node:assert';
import { extractCssColors, extractFontFamilies, extractContrastIssues, contrastRatio } from '../dist/lib/design.js';


const html = `<div style="color:#333333;background-color:#ffffff;font-family:'Roboto', sans-serif"><img src='img.jpg'></div>`;
const mockVibrant = {
  from: () => ({
    getPalette: async () => ({ Vibrant: { hex: '#112233' } })
  })
};
const palette = await extractCssColors(html, mockVibrant);
assert.ok(palette.includes('#112233'));

const fonts = extractFontFamilies(html);
assert.ok(fonts.includes('Roboto'));
const issues = extractContrastIssues(`<div style="color:#777777;background-color:#888888">test</div>`);
assert.strictEqual(issues.length, 1);
assert.ok(contrastRatio('#ffffff','#000000') > 4.5);
console.log('design test passed');

import assert from 'node:assert';
import { extractCssColors, extractFontFamilies, extractContrastIssues, contrastRatio } from '../dist/lib/design.js';

const html = `<div style="color:#333333;background-color:#ffffff;font-family:'Roboto', sans-serif">A</div>`;
const imgHtml = `${html}<img src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/5+BAQAE/wPh61QAAAAASUVORK5CYII=" />`;
const palette = await extractCssColors(imgHtml);
assert.ok(palette.includes('#ff0000') || palette.includes('#333333'));
const fonts = extractFontFamilies(html);
assert.ok(fonts.includes('Roboto'));
const issues = extractContrastIssues(`<div style="color:#777777;background-color:#888888">test</div>`);
assert.strictEqual(issues.length, 1);
assert.ok(contrastRatio('#ffffff','#000000') > 4.5);
console.log('design test passed');

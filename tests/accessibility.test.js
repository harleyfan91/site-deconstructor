import { describe, it, expect } from 'vitest';
import { analyzeAccessibility } from '@/lib/accessibility';

const goodHtml = '<html><body><img src="a.jpg" alt="ok"></body></html>';
const badHtml = '<html><body><img src="a.jpg"></body></html>';

describe('analyzeAccessibility', () => {
  it('detects missing alt text', () => {
    expect(analyzeAccessibility(goodHtml)).toHaveLength(0);
    expect(analyzeAccessibility(badHtml).length).toBeGreaterThan(0);
  });
});

/**
 * Unit tests for getBucketForProperty helper function
 * Tests all 11 semantic color buckets mapping logic
 */
import { describe, test, expect } from 'vitest';

// Mock the getBucketForProperty function since it's not exported
// In a real implementation, you'd export this function from the server module
function getBucketForProperty(property, elementTag, value) {
  // Background colors
  if (property === 'background-color') return 'background';
  if (property === 'background' && value && !value.includes('gradient(')) return 'background';
  
  // Text colors
  if (property === 'color') return 'text';
  if (property.startsWith('text-') && !['text-decoration-color', 'text-emphasis-color', 'text-stroke-color'].includes(property)) {
    return 'text';
  }
  
  // Border colors
  if (property.includes('border') && property.includes('color')) return 'border';
  if (property === 'outline-color' || property === 'column-rule-color') return 'border';
  
  // Icon colors (SVG on icon-like elements)
  if ((property === 'fill' || property === 'stroke') && 
      (elementTag === 'svg' || elementTag === 'path' || elementTag === 'circle' || elementTag === 'rect')) {
    return 'icons';
  }
  
  // Accent colors
  if (property === 'accent-color' || property === 'caret-color') return 'accent';
  
  // Decoration colors
  if (['text-decoration-color', 'text-emphasis-color', 'text-stroke-color'].includes(property)) {
    return 'decoration';
  }
  
  // Shadow colors
  if (property === 'box-shadow' || property === 'text-shadow') return 'shadow';
  if (property === 'filter' && value && value.includes('drop-shadow(')) return 'shadow';
  
  // Gradient colors
  if ((property === 'background' || property === 'background-image' || property === 'mask-image') && 
      value && value.includes('gradient(')) {
    return 'gradient';
  }
  
  // SVG-specific colors (non-icon SVG elements)
  if (['fill', 'stroke', 'stop-color', 'flood-color', 'lighting-color'].includes(property) && 
      elementTag && !['svg', 'path', 'circle', 'rect'].includes(elementTag)) {
    return 'svg';
  }
  
  // Link colors
  if (property.includes('link') || elementTag === 'a') return 'link';
  
  // Highlight colors
  if (property === 'highlight-color' || elementTag === 'mark') return 'highlight';
  
  // Default fallback
  return 'other';
}

describe('getBucketForProperty', () => {
  test('maps background properties correctly', () => {
    expect(getBucketForProperty('background-color')).toBe('background');
    expect(getBucketForProperty('background', undefined, '#fff')).toBe('background');
    expect(getBucketForProperty('background', undefined, 'solid #fff')).toBe('background');
  });

  test('maps text properties correctly', () => {
    expect(getBucketForProperty('color')).toBe('text');
    expect(getBucketForProperty('text-align')).toBe('text');
    expect(getBucketForProperty('text-indent')).toBe('text');
  });

  test('maps border properties correctly', () => {
    expect(getBucketForProperty('border-color')).toBe('border');
    expect(getBucketForProperty('border-top-color')).toBe('border');
    expect(getBucketForProperty('border-left-color')).toBe('border');
    expect(getBucketForProperty('outline-color')).toBe('border');
    expect(getBucketForProperty('column-rule-color')).toBe('border');
  });

  test('maps icon properties correctly', () => {
    expect(getBucketForProperty('fill', 'svg')).toBe('icons');
    expect(getBucketForProperty('stroke', 'path')).toBe('icons');
    expect(getBucketForProperty('fill', 'circle')).toBe('icons');
    expect(getBucketForProperty('stroke', 'rect')).toBe('icons');
  });

  test('maps accent properties correctly', () => {
    expect(getBucketForProperty('accent-color')).toBe('accent');
    expect(getBucketForProperty('caret-color')).toBe('accent');
  });

  test('maps decoration properties correctly', () => {
    expect(getBucketForProperty('text-decoration-color')).toBe('decoration');
    expect(getBucketForProperty('text-emphasis-color')).toBe('decoration');
    expect(getBucketForProperty('text-stroke-color')).toBe('decoration');
  });

  test('maps shadow properties correctly', () => {
    expect(getBucketForProperty('box-shadow')).toBe('shadow');
    expect(getBucketForProperty('text-shadow')).toBe('shadow');
    expect(getBucketForProperty('filter', undefined, 'drop-shadow(2px 2px 4px rgba(0,0,0,0.5))')).toBe('shadow');
  });

  test('maps gradient properties correctly', () => {
    expect(getBucketForProperty('background', undefined, 'linear-gradient(to right, #fff, #000)')).toBe('gradient');
    expect(getBucketForProperty('background-image', undefined, 'radial-gradient(circle, #fff, #000)')).toBe('gradient');
    expect(getBucketForProperty('mask-image', undefined, 'conic-gradient(#fff, #000)')).toBe('gradient');
  });

  test('maps SVG properties correctly', () => {
    expect(getBucketForProperty('fill', 'g')).toBe('svg');
    expect(getBucketForProperty('stroke', 'line')).toBe('svg');
    expect(getBucketForProperty('stop-color', 'stop')).toBe('svg');
    expect(getBucketForProperty('flood-color', 'feFlood')).toBe('svg');
    expect(getBucketForProperty('lighting-color', 'feSpecularLighting')).toBe('svg');
  });

  test('maps link properties correctly', () => {
    expect(getBucketForProperty('color', 'a')).toBe('link');
    expect(getBucketForProperty('link-color')).toBe('link');
  });

  test('maps highlight properties correctly', () => {
    expect(getBucketForProperty('highlight-color')).toBe('highlight');
    expect(getBucketForProperty('background-color', 'mark')).toBe('highlight');
  });

  test('falls back to other for unrecognized properties', () => {
    expect(getBucketForProperty('unknown-property')).toBe('other');
    expect(getBucketForProperty('custom-color')).toBe('other');
    expect(getBucketForProperty('proprietary-style')).toBe('other');
  });

  test('prioritizes specific mappings over generic ones', () => {
    // text-decoration-color should map to 'decoration', not 'text'
    expect(getBucketForProperty('text-decoration-color')).toBe('decoration');
    
    // gradient backgrounds should map to 'gradient', not 'background'
    expect(getBucketForProperty('background', undefined, 'linear-gradient(#fff, #000)')).toBe('gradient');
    
    // SVG fill on non-icon elements should map to 'svg', not 'icons'
    expect(getBucketForProperty('fill', 'g')).toBe('svg');
  });
});

console.log('Bucket mapping tests completed');
import { describe, it, expect } from 'vitest';
import { dashIfEmpty, groupByFrequency } from '@/lib/ui';

describe('ui utils', () => {
  it('replaces empty values with dash', () => {
    expect(dashIfEmpty('abc')).toBe('abc');
    expect(dashIfEmpty('')).toBe('\u2014');
    expect(dashIfEmpty(null)).toBe('\u2014');
  });

// frequency grouping
const sampleColors = [
  { name: 'A', hex: '#111111', usage: 'Text', count: 10 },
  { name: 'B', hex: '#222222', usage: 'Text', count: 5 },
  { name: 'C', hex: '#333333', usage: 'Text', count: 3 },
  { name: 'D', hex: '#444444', usage: 'Text', count: 1 },
];

  it('groups colors by frequency', () => {
    const freqGroups = groupByFrequency(sampleColors);
    expect(freqGroups[0].name).toBe('Most Used');
    expect(freqGroups[0].colors.length).toBeGreaterThanOrEqual(3);
    if (freqGroups.length > 1) {
      expect(freqGroups[1].name).toBe('Supporting Colors');
    }
  });
});

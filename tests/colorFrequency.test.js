import { describe, it, expect } from 'vitest';
import { groupByFrequency } from '@/lib/ui';

const colors = [
  { name: 'A', hex: '#111111', usage: 'Text', count: 8 },
  { name: 'B', hex: '#222222', usage: 'Text', count: 6 },
  { name: 'C', hex: '#333333', usage: 'Text', count: 4 },
  { name: 'D', hex: '#444444', usage: 'Text', count: 2 },
  { name: 'E', hex: '#555555', usage: 'Text', count: 1 },
];

describe('groupByFrequency', () => {
  it('groups colors into buckets by usage', () => {
    const groups = groupByFrequency(colors);
    expect(groups[0].name).toBe('Most Used');
    expect(groups[0].colors.length).toBeGreaterThanOrEqual(3);
    if (groups.length > 1) {
      expect(groups[1].name).toBe('Supporting Colors');
    }
    if (groups.length > 2) {
      expect(groups[2].name).toBe('Accent Colors');
    }
  });
});

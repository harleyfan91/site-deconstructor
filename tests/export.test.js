import { describe, it, expect } from 'vitest';
import { analysesToCsv, analysesToJSON, parseAnalysesJSON } from '@/lib/export';
import { createDefaultAnalysis } from '@/lib/analysisDefaults';

describe('export utilities', () => {
  it('converts analyses to csv and json', () => {
    const rec1 = createDefaultAnalysis('https://a.com');
    const rec2 = createDefaultAnalysis('https://b.com');
    const csv = analysesToCsv([rec1, rec2]);
    expect(csv.includes('https://a.com')).toBe(true);
    expect(csv.split('\n').length).toBe(3);
    const jsonStr = analysesToJSON([rec1, rec2]);
    const parsed = parseAnalysesJSON(jsonStr);
    expect(parsed.length).toBe(2);
    expect(parsed[0].url).toBe('https://a.com');
  });
});

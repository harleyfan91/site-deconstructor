import { describe, it, expect } from 'vitest';
import { createDefaultAnalysis } from '@/lib/analysisDefaults';

describe('createDefaultAnalysis', () => {
  it('returns a default analysis record', () => {
    const record = createDefaultAnalysis('https://example.com');
    expect(record.coreWebVitals.lcp).toBe(0);
    expect(record.coreWebVitals.fid).toBe(0);
    expect(record.coreWebVitals.cls).toBe(0);
    expect(record.securityHeaders).toBeDefined();
    expect(record.performanceScore).toBe(0);
    expect(record.seoScore).toBe(0);
    expect(record.readabilityScore).toBe(0);
    expect(record.complianceStatus).toBe('warn');
    expect(Array.isArray(record.data.ui.contrastIssues)).toBe(true);
    expect(record.data.performance.mobileResponsive).toBe(false);
    expect(record.data.seo.metaTags).toEqual({});
    expect(record.data.technical.securityScore).toBe(0);
  });
});

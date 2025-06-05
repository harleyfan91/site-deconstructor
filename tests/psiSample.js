export const mockPSIResponse = {
  lighthouseResult: {
    categories: {
      performance: { score: 0.9 },
      accessibility: { score: 0.88 },
      seo: { score: 0.93 }
    },
    audits: {
      'largest-contentful-paint': { numericValue: 1500, displayValue: '1.5\u00a0s' },
      'first-input-delay': { numericValue: 10, displayValue: '10\u00a0ms' },
      'cumulative-layout-shift': { numericValue: 0.01, displayValue: '0.01' }
    }
  }
};

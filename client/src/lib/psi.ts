export interface PSIResult {
  coreWebVitals: { lcp: number; fid: number; cls: number };
  performanceScore: number;
  seoScore: number;
  readabilityScore: number;
}

export async function fetchPSIData(url: string, fetcher: typeof fetch = fetch): Promise<PSIResult> {
  const apiUrl = `https://www.googleapis.com/pagespeedonline/v5/runPagespeed?url=${encodeURIComponent(url)}&category=performance&category=accessibility&category=seo`;
  try {
    const res = await fetcher(apiUrl);
    if (!res.ok) {
      throw new Error(`PSI request failed: ${res.status}`);
    }
    const json = await res.json();
    return mapPSIResponse(json);
  } catch (_e) {
    return {
      coreWebVitals: { lcp: 0, fid: 0, cls: 0 },
      performanceScore: 0,
      seoScore: 0,
      readabilityScore: 0,
    };
  }
}

export function mapPSIResponse(data: any): PSIResult {
  const lhr = data?.lighthouseResult || {};
  const audits = lhr.audits || {};
  const categories = lhr.categories || {};
  return {
    coreWebVitals: {
      lcp: (audits['largest-contentful-paint']?.numericValue || 0) / 1000,
      fid: audits['first-input-delay']?.numericValue || 0,
      cls: audits['cumulative-layout-shift']?.numericValue || 0,
    },
    performanceScore: categories.performance?.score ?? 0,
    seoScore: categories.seo?.score ?? 0,
    readabilityScore: categories.accessibility?.score ?? 0,
  };
}

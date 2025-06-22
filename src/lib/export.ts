
export interface CSVOptions {
  delimiter?: string;
}

import type { AnalysisResponse } from '@/types/analysis';

function flatten(record: AnalysisResponse): Record<string, any> {
  const imageData = record.data?.ui?.imageAnalysis;
  const metaTags = record.data?.seo?.metaTags || {};
  
  return {
    url: record.url ?? '',
    timestamp: record.timestamp ?? '',
    status: record.status ?? '',
    lcp: record.coreWebVitals?.lcp ?? '',
    fid: record.coreWebVitals?.fid ?? '',
    cls: record.coreWebVitals?.cls ?? '',
    performanceScore: record.performanceScore ?? '',
    seoScore: record.seoScore ?? '',
    readabilityScore: record.readabilityScore ?? '',
    complianceStatus: record.complianceStatus ?? '',
    totalImages: imageData?.totalImages ?? '',
    estimatedPhotos: imageData?.estimatedPhotos ?? '',
    estimatedIcons: imageData?.estimatedIcons ?? '',
    titleTag: metaTags.title ? 'Present' : 'Missing',
    metaDescription: metaTags.description ? 'Present' : 'Missing',
    canonicalUrl: metaTags.canonical ? 'Present' : 'Missing',
    openGraphTags: (metaTags['og:title'] || metaTags['og:description']) ? 'Present' : 'Missing',
  };
}

export function analysesToCsv(records: AnalysisResponse[], opts: CSVOptions = {}): string {
  const delimiter = opts.delimiter || ',';
  if (records.length === 0) return '';
  const flats = records.map(flatten);
  const headers = Object.keys(flats[0]);
  const lines = [headers.join(delimiter)];
  for (const rec of flats) {
    lines.push(headers.map(h => JSON.stringify(rec[h] ?? '')).join(delimiter));
  }
  return lines.join('\n');
}

export function analysisToCsv(record: AnalysisResponse, opts: CSVOptions = {}): string {
  return analysesToCsv([record], opts);
}

export function analysesToJSON(records: AnalysisResponse[]): string {
  return JSON.stringify(records, null, 2);
}

export function analysisToJSON(record: AnalysisResponse): string {
  return JSON.stringify(record, null, 2);
}

export function parseAnalysesJSON(json: string): AnalysisResponse[] {
  try {
    const data = JSON.parse(json);
    if (Array.isArray(data)) return data as AnalysisResponse[];
    if (data && typeof data === 'object') return [data as AnalysisResponse];
    return [];
  } catch {
    return [];
  }
}

import type { AnalysisResponse } from '@/types/analysis';

export interface SimpleAnalysisResponse {
  id: string;
  url: string;
  status: 'ok' | 'error';
  duration_ms: number;
  error?: string | null;
  results: {
    data: any;
  };
}

// Convert server's simple analysis response into AnalysisResponse shape
export function adaptSimpleResponse(res: SimpleAnalysisResponse): AnalysisResponse {
  const data = res.results?.data || {};
  const merged = { ...data, ...(data.ui || {}) };
  return {
    id: res.id,
    url: res.url,
    status: res.status === 'ok' ? 'complete' : 'error',
    data: merged
  } as AnalysisResponse;
}

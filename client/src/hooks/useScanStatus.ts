import { useQuery } from '@tanstack/react-query';
import { apiRequest } from '../lib/apiFetch';

export interface ScanStatus {
  status: 'queued' | 'running' | 'complete' | 'failed';
  progress: number;
  scanId: string;
  url?: string;
  finishedAt?: string;
}

export function useScanStatus(scanId: string) {
  return useQuery({
    queryKey: ['scanStatus', scanId],
    queryFn: () => apiRequest<ScanStatus>(`/api/scans/${scanId}/status`),
    refetchInterval: (query) => {
      // Stop polling when scan is complete or failed
      if (query.state.data?.status === 'complete' || query.state.data?.status === 'failed') {
        return false;
      }
      return 2000; // Poll every 2 seconds while in progress
    },
    enabled: !!scanId,
  });
}
import { useQuery } from '@tanstack/react-query';

export interface ScanStatus {
  status: 'queued' | 'running' | 'complete' | 'failed';
  progress: number;
  scanId: string;
  url?: string;
}

export function useScanStatus(scanId: string) {
  return useQuery({
    queryKey: ['scanStatus', scanId],
    queryFn: async (): Promise<ScanStatus> => {
      const res = await fetch(`/api/scans/${scanId}/status`);
      if (!res.ok) {
        throw new Error(`Status fetch failed: ${res.status}`);
      }
      return res.json();
    },
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
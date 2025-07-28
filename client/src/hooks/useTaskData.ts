import { useQuery } from '@tanstack/react-query';
import { apiRequest } from '../lib/apiFetch';

export interface TaskData {
  type: 'tech' | 'colors' | 'seo' | 'perf';
  status: 'queued' | 'running' | 'complete' | 'failed';
  data?: any;
  error?: string;
  completedAt?: string;
}

export function useTaskData(scanId: string, type: string) {
  return useQuery({
    queryKey: ['task', scanId, type],
    queryFn: () => apiRequest<TaskData>(`/api/scans/${scanId}/task/${type}`),
    staleTime: Infinity, // Cache completed tasks forever
    refetchInterval: (query) => {
      // Stop polling when task is complete or failed
      if (query.state.data?.status === 'complete' || query.state.data?.status === 'failed') {
        return false;
      }
      return 5000; // Poll every 5 seconds while in progress
    },
    enabled: !!scanId && !!type,
  });
}
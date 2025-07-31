import { renderHook, waitFor } from '@testing-library/react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useScanProgress } from '@/hooks/useScanProgress';
import { ReactNode } from 'react';

// Mock the supabase client
vi.mock('@/lib/supabaseClient', () => ({
  supabase: {
    channel: vi.fn(() => ({
      on: vi.fn().mockReturnThis(),
      subscribe: vi.fn((callback) => {
        // Simulate successful subscription
        callback('SUBSCRIBED');
        return undefined;
      }),
    })),
    removeChannel: vi.fn(),
  },
}));
import { supabase } from '@/lib/supabaseClient';

// Mock useScanStatus hook
vi.mock('../../client/src/hooks/useScanStatus', () => ({
  useScanStatus: vi.fn(() => ({
    data: { progress: 50, status: 'running' },
    isLoading: false,
  })),
}));

describe('useScanProgress', () => {
  let queryClient: QueryClient;
  const originalEnv = { ...import.meta.env };

  const wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false },
      },
    });
    vi.clearAllMocks();
    import.meta.env = { ...originalEnv, VITE_SUPABASE_ANON_KEY: 'key', VITE_SUPABASE_URL: 'url' };
  });

  afterEach(() => {
    import.meta.env = originalEnv;
  });

  it('should return initial progress from polling fallback', () => {
    const { result } = renderHook(() => useScanProgress('test-scan'), { wrapper });
    
    expect(result.current.progress).toBe(50);
    expect(result.current.status).toBe('running');
  });

  it('should handle empty scanId gracefully', () => {
    const { result } = renderHook(() => useScanProgress(''), { wrapper });

    expect(result.current.progress).toBe(50);
    expect(result.current.status).toBe('running');
  });

  it.skip('should set up Supabase subscription with correct parameters', async () => {
    renderHook(() => useScanProgress('test-scan'), { wrapper });
    await waitFor(() => {
      expect(supabase.channel).toHaveBeenCalledWith('scan_status_test-scan');
    });
  });

  it.skip('should clean up subscription on unmount', async () => {
    const mockChannel = { on: vi.fn().mockReturnThis(), subscribe: vi.fn() };
    supabase.channel.mockReturnValue(mockChannel);
    
    const { unmount } = renderHook(() => useScanProgress('test-scan'), { wrapper });

    unmount();
    await waitFor(() => {
      expect(supabase.removeChannel).toHaveBeenCalledWith(mockChannel);
    });
  });

  it('should handle Supabase configuration errors', () => {
    // Mock environment variables as undefined
    const originalEnv = import.meta.env;
    import.meta.env = { ...originalEnv, VITE_SUPABASE_URL: undefined };
    
    const { result } = renderHook(() => useScanProgress('test-scan'), { wrapper });
    
    // Should fall back to polling data
    expect(result.current.progress).toBe(50);
    expect(result.current.status).toBe('running');
    
    // Restore original env
    import.meta.env = originalEnv;
  });
});
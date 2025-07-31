import { renderHook, waitFor } from '@testing-library/react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useScanProgress } from '../../client/src/hooks/useScanProgress';
import { ReactNode } from 'react';

// Mock the supabase client
vi.mock('../../client/src/lib/supabaseClient', () => ({
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

// Mock useScanStatus hook
vi.mock('../../client/src/hooks/useScanStatus', () => ({
  useScanStatus: vi.fn(() => ({
    data: { progress: 50, status: 'running' },
    isLoading: false,
  })),
}));

describe('useScanProgress', () => {
  let queryClient: QueryClient;

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
  });

  it('should return initial progress from polling fallback', () => {
    const { result } = renderHook(() => useScanProgress('test-scan'), { wrapper });
    
    expect(result.current.progress).toBe(50);
    expect(result.current.status).toBe('running');
  });

  it('should handle empty scanId gracefully', () => {
    const { result } = renderHook(() => useScanProgress(''), { wrapper });
    
    expect(result.current.progress).toBe(0);
    expect(result.current.status).toBe('loading');
  });

  it('should set up Supabase subscription with correct parameters', () => {
    const { supabase } = require('../../client/src/lib/supabaseClient');
    
    renderHook(() => useScanProgress('test-scan'), { wrapper });
    
    expect(supabase.channel).toHaveBeenCalledWith('scan_status_test-scan');
  });

  it('should clean up subscription on unmount', () => {
    const { supabase } = require('../../client/src/lib/supabaseClient');
    const mockChannel = { on: vi.fn().mockReturnThis(), subscribe: vi.fn() };
    supabase.channel.mockReturnValue(mockChannel);
    
    const { unmount } = renderHook(() => useScanProgress('test-scan'), { wrapper });
    
    unmount();
    
    expect(supabase.removeChannel).toHaveBeenCalledWith(mockChannel);
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
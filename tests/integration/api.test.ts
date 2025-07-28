import { describe, it, expect, beforeEach, vi } from 'vitest';
import { apiRequest } from '../../client/src/lib/apiFetch';

// Mock supabase client
const mockGetSession = vi.fn();
vi.mock('../../client/src/lib/supabaseClient', () => ({
  supabase: {
    auth: {
      getSession: mockGetSession,
    },
  },
}));

// Mock fetch
global.fetch = vi.fn();

describe('API Integration', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockGetSession.mockResolvedValue({
      data: { session: { access_token: 'fake-jwt-token' } }
    });
  });

  it('should include Authorization header when user is authenticated', async () => {
    const mockResponse = { ok: true, json: () => Promise.resolve({ success: true }) };
    (global.fetch as any).mockResolvedValue(mockResponse);

    await apiRequest('/api/scans', { method: 'POST' });

    expect(global.fetch).toHaveBeenCalledWith('/api/scans', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer fake-jwt-token',
      },
    });
  });

  it('should not include Authorization header when user is not authenticated', async () => {
    mockGetSession.mockResolvedValue({ data: { session: null } });
    const mockResponse = { ok: true, json: () => Promise.resolve({ success: true }) };
    (global.fetch as any).mockResolvedValue(mockResponse);

    await apiRequest('/api/scans', { method: 'POST' });

    expect(global.fetch).toHaveBeenCalledWith('/api/scans', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    });
  });

  it('should throw error for non-ok responses', async () => {
    const mockResponse = { 
      ok: false, 
      status: 401,
      text: () => Promise.resolve('Unauthorized') 
    };
    (global.fetch as any).mockResolvedValue(mockResponse);

    await expect(apiRequest('/api/scans')).rejects.toThrow('API Error 401: Unauthorized');
  });

  it('should handle network errors', async () => {
    (global.fetch as any).mockRejectedValue(new Error('Network error'));

    await expect(apiRequest('/api/scans')).rejects.toThrow('Network error');
  });

  it('should preserve custom headers', async () => {
    const mockResponse = { ok: true, json: () => Promise.resolve({ success: true }) };
    (global.fetch as any).mockResolvedValue(mockResponse);

    await apiRequest('/api/scans', {
      method: 'POST',
      headers: { 'X-Custom-Header': 'custom-value' },
    });

    expect(global.fetch).toHaveBeenCalledWith('/api/scans', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer fake-jwt-token',
        'X-Custom-Header': 'custom-value',
      },
    });
  });
});
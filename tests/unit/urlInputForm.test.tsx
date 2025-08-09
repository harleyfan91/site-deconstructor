import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import URLInputForm from '@/components/URLInputForm';

const setAnalysis = vi.fn();
const setError = vi.fn();
const setLoading = vi.fn();
vi.mock('@/contexts/AnalysisContext', () => ({
  useAnalysisContext: () => ({ setAnalysis, setError, setLoading, loading: false, error: null })
}));
vi.mock('react-router-dom', () => ({
  useNavigate: () => vi.fn(),
}));

describe('URLInputForm', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('calls /api/overview and stores result in context', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: vi.fn().mockResolvedValue({
        id: '1',
        url: 'https://example.com',
        status: 'ok',
        duration_ms: 10,
        results: { data: {} }
      }),
    });
    global.fetch = fetchMock as any;

    render(<URLInputForm />);

    fireEvent.change(screen.getByPlaceholderText(/enter website url/i), { target: { value: 'https://example.com' } });
    fireEvent.submit(screen.getByRole('button').closest('form')!);

    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalledWith('/api/overview', expect.objectContaining({ method: 'POST' }));
    });

    expect(setAnalysis).toHaveBeenCalled();
  });
});

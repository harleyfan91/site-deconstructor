import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import URLInputForm from '@/components/URLInputForm';

vi.mock('@/contexts/AnalysisContext', () => ({
  useAnalysisContext: () => ({ analyzeWebsite: vi.fn(), loading: false, error: null })
}));
vi.mock('react-router-dom', () => ({
  useNavigate: () => vi.fn(),
}));

describe('URLInputForm', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('posts to /api/scans and logs status', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      status: 201,
      json: vi.fn().mockResolvedValue({ id: '1', url: 'https://example.com', created_at: 'now' }),
      ok: true,
    });
    global.fetch = fetchMock as any;
    const logSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

    render(<URLInputForm />);

    fireEvent.change(screen.getByPlaceholderText(/enter website url/i), { target: { value: 'https://example.com' } });
    fireEvent.submit(screen.getByRole('button').closest('form')!);

    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalledWith('/api/scans', expect.objectContaining({ method: 'POST' }));
    });

    expect(logSpy).toHaveBeenCalledWith('📥 /api/scans status', 201);
  });
});

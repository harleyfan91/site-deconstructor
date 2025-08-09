import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import URLInputForm from '@/components/URLInputForm';

const analyzeWebsite = vi.fn().mockResolvedValue({});
const navigateMock = vi.fn();

vi.mock('@/contexts/AnalysisContext', () => ({
  useAnalysisContext: () => ({ analyzeWebsite, loading: false, error: null })
}));
vi.mock('react-router-dom', () => ({
  useNavigate: () => navigateMock,
}));

describe('URLInputForm', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('calls analyzeWebsite and navigates on success', async () => {
    render(<URLInputForm />);

    fireEvent.change(screen.getByPlaceholderText(/enter website url/i), { target: { value: 'https://example.com' } });
    fireEvent.submit(screen.getByRole('button').closest('form')!);

    await waitFor(() => {
      expect(analyzeWebsite).toHaveBeenCalledWith('https://example.com');
      expect(navigateMock).toHaveBeenCalledWith('/dashboard');
    });
  });
});

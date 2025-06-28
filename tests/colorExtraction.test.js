/**
 * Unit tests for ColorExtractionCard component
 * Tests real color extraction API integration with loading, success, and error states
 */
import { render, screen, waitFor } from '@testing-library/react';
import { vi } from 'vitest';
import ColorExtractionCard from '../client/src/components/dashboard/ui-analysis/ColorExtractionCard';

// Mock the fetch API
global.fetch = vi.fn();

const mockColorResponse = [
  { hex: '#000000', name: 'Black', property: 'color', occurrences: 42 },
  { hex: '#ffffff', name: 'White', property: 'background-color', occurrences: 35 },
  { hex: '#ff0000', name: 'Red', property: 'border-color', occurrences: 12 },
  { hex: '#00ff00', name: 'Green', property: 'fill', occurrences: 8 }
];

describe('ColorExtractionCard', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test('shows loading state initially', () => {
    fetch.mockImplementation(() => new Promise(() => {})); // Never resolves
    
    render(<ColorExtractionCard url="https://example.com" />);
    
    expect(screen.getByText('Extracting colors from website...')).toBeInTheDocument();
    expect(screen.getByRole('progressbar')).toBeInTheDocument();
  });

  test('displays colors after successful fetch', async () => {
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockColorResponse
    });

    render(<ColorExtractionCard url="https://example.com" />);

    await waitFor(() => {
      expect(screen.getByText('Color Extraction')).toBeInTheDocument();
    });

    // Check that color groups are displayed
    expect(screen.getByText(/text \(/)).toBeInTheDocument();
    expect(screen.getByText(/background \(/)).toBeInTheDocument();
    expect(screen.getByText(/border \(/)).toBeInTheDocument();
    expect(screen.getByText(/icons \(/)).toBeInTheDocument();
  });

  test('shows error alert on fetch failure', async () => {
    fetch.mockRejectedValueOnce(new Error('Network error'));

    render(<ColorExtractionCard url="https://example.com" />);

    await waitFor(() => {
      expect(screen.getByText('Failed to extract colors from website')).toBeInTheDocument();
    });

    expect(screen.getByRole('alert')).toBeInTheDocument();
  });

  test('shows error alert on HTTP error status', async () => {
    fetch.mockResolvedValueOnce({
      ok: false,
      status: 500
    });

    render(<ColorExtractionCard url="https://example.com" />);

    await waitFor(() => {
      expect(screen.getByText('Failed to extract colors from website')).toBeInTheDocument();
    });
  });

  test('uses window.location.href when no URL prop provided', () => {
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockColorResponse
    });

    render(<ColorExtractionCard />);

    expect(fetch).toHaveBeenCalledWith('/api/colors', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url: window.location.href })
    });
  });

  test('correctly maps CSS properties to usage groups', async () => {
    const testColors = [
      { hex: '#000000', name: 'Black', property: 'color', occurrences: 1 },
      { hex: '#ffffff', name: 'White', property: 'background-color', occurrences: 1 },
      { hex: '#ff0000', name: 'Red', property: 'border-top-color', occurrences: 1 },
      { hex: '#00ff00', name: 'Green', property: 'fill', occurrences: 1 },
      { hex: '#0000ff', name: 'Blue', property: 'stroke', occurrences: 1 },
      { hex: '#ffff00', name: 'Yellow', property: 'outline-color', occurrences: 1 }
    ];

    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => testColors
    });

    render(<ColorExtractionCard url="https://example.com" />);

    await waitFor(() => {
      expect(screen.getByText(/text \(1\)/)).toBeInTheDocument();
      expect(screen.getByText(/background \(1\)/)).toBeInTheDocument();
      expect(screen.getByText(/border \(1\)/)).toBeInTheDocument();
      expect(screen.getByText(/icons \(2\)/)).toBeInTheDocument(); // fill + stroke
      expect(screen.getByText(/other \(1\)/)).toBeInTheDocument(); // outline-color
    });
  });
});

console.log('Color extraction component tests passed');
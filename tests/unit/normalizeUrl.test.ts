import { describe, it, expect } from 'vitest';
import { normalizeUrl } from '@shared/utils/normalizeUrl';

describe('normalizeUrl', () => {
  it('adds https when missing', () => {
    expect(normalizeUrl('example.com')).toBe('https://example.com');
  });

  it('preserves existing protocol', () => {
    expect(normalizeUrl('http://test.com')).toBe('http://test.com');
    expect(normalizeUrl('https://test.com')).toBe('https://test.com');
  });
});

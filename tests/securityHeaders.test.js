import { describe, it, expect } from 'vitest';
import { extractSecurityHeaders } from '@/lib/accessibility';

const headers = {
  'content-security-policy': "default-src 'self'",
  'strict-transport-security': 'max-age=63072000',
  'x-frame-options': 'DENY',
  'x-content-type-options': 'nosniff',
  'referrer-policy': 'no-referrer'
};

describe('extractSecurityHeaders', () => {
  it('parses headers correctly', () => {
    const result = extractSecurityHeaders(headers);
    expect(result.csp).toBe(headers['content-security-policy']);
    expect(result.hsts).toBe(headers['strict-transport-security']);
    expect(result.xfo).toBe(headers['x-frame-options']);
    expect(result.xcto).toBe(headers['x-content-type-options']);
    expect(result.referrer).toBe(headers['referrer-policy']);
  });

  it('handles empty headers', () => {
    const empty = extractSecurityHeaders({});
    expect(empty.csp).toBe('');
    expect(empty.hsts).toBe('');
  });
});

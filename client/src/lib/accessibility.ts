import { AccessibilityViolation, SecurityHeaders } from '@/types/analysis';

export function analyzeAccessibility(html: string): AccessibilityViolation[] {
  const violations: AccessibilityViolation[] = [];
  try {
    const imgRegex = /<img[^>]*>/gi;
    const imgs = html.match(imgRegex) || [];
    for (const img of imgs) {
      if (!/alt\s*=/.test(img)) {
        violations.push({ id: 'image-alt', impact: 'moderate', description: 'Image tag missing alt text' });
        break;
      }
    }
  } catch (_e) {
    // ignore errors, return empty violations
  }
  return violations;
}

export function extractSecurityHeaders(headers: Record<string, string> | Headers): SecurityHeaders {
  const get = (name: string) => {
    if (headers instanceof Headers) {
      return headers.get(name) || '';
    }
    return headers[name.toLowerCase()] || headers[name] || '';
  };
  return {
    csp: get('content-security-policy'),
    hsts: get('strict-transport-security'),
    xfo: get('x-frame-options'),
    xcto: get('x-content-type-options'),
    referrer: get('referrer-policy'),
  };
}

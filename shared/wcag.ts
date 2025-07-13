/**
 * WCAG contrast ratio utilities
 * Provides standardized contrast calculations and compliance checking
 */

/**
 * Convert a hex color to RGB values
 */
function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : null;
}

/**
 * Convert RGB to relative luminance
 */
function getLuminance(r: number, g: number, b: number): number {
  const [rs, gs, bs] = [r, g, b].map(c => {
    c = c / 255;
    return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
}

/**
 * Parse color string (hex, rgb, rgba) to RGB values
 */
function parseColor(color: string): { r: number; g: number; b: number } | null {
  // Handle hex colors
  if (color.startsWith('#')) {
    return hexToRgb(color);
  }
  
  // Handle rgb/rgba colors
  const rgbMatch = color.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
  if (rgbMatch) {
    return {
      r: parseInt(rgbMatch[1], 10),
      g: parseInt(rgbMatch[2], 10),
      b: parseInt(rgbMatch[3], 10)
    };
  }
  
  return null;
}

/**
 * Calculate contrast ratio between two colors
 * @param fg Foreground color (hex, rgb, or rgba string)
 * @param bg Background color (hex, rgb, or rgba string)
 * @returns Contrast ratio (1-21)
 */
export function contrastRatio(fg: string, bg: string): number {
  const fgRgb = parseColor(fg);
  const bgRgb = parseColor(bg);
  
  if (!fgRgb || !bgRgb) {
    return 1; // Worst possible ratio if colors can't be parsed
  }
  
  const fgLuminance = getLuminance(fgRgb.r, fgRgb.g, fgRgb.b);
  const bgLuminance = getLuminance(bgRgb.r, bgRgb.g, bgRgb.b);
  
  const lighter = Math.max(fgLuminance, bgLuminance);
  const darker = Math.min(fgLuminance, bgLuminance);
  
  return (lighter + 0.05) / (darker + 0.05);
}

/**
 * Check if contrast ratio passes WCAG 2.0 AA standards
 * @param ratio Contrast ratio
 * @param largeText Whether this is large text (18pt+ or 14pt+ bold)
 * @returns True if passes AA standards
 */
export function passesAA(ratio: number, largeText = false): boolean {
  return ratio >= (largeText ? 3.0 : 4.5);
}

/**
 * Check if contrast ratio passes WCAG 2.0 AAA standards
 * @param ratio Contrast ratio
 * @param largeText Whether this is large text (18pt+ or 14pt+ bold)
 * @returns True if passes AAA standards
 */
export function passesAAA(ratio: number, largeText = false): boolean {
  return ratio >= (largeText ? 4.5 : 7.0);
}

/**
 * Get the minimum required ratio for WCAG AA compliance
 * @param largeText Whether this is large text
 * @returns Minimum contrast ratio required
 */
export function getRequiredRatioAA(largeText = false): number {
  return largeText ? 3.0 : 4.5;
}

/**
 * Get the minimum required ratio for WCAG AAA compliance
 * @param largeText Whether this is large text
 * @returns Minimum contrast ratio required
 */
export function getRequiredRatioAAA(largeText = false): number {
  return largeText ? 4.5 : 7.0;
}
/**
 * Consolidated UI Analysis types - replaces ColorAnalysis and FontAnalysis
 */

export interface ColorResult {
  hex: string;
  name: string;
  property: string;
  occurrences: number;
}

export interface FontResult {
  name: string;
  category: string;
  usage: string;
  fallbacks: string[];
  weights: number[];
  isSystemFont: boolean;
}

export interface ImageResult {
  url: string;
  alt: string;
  width: number;
  height: number;
  type: 'photo' | 'icon' | 'logo';
  format: string;
}

export interface ContrastIssue {
  element: string;
  textColor: string;
  backgroundColor: string;
  ratio: number;
  expectedRatio: number;
  severity: 'low' | 'medium' | 'high';
  recommendation: string;
}

export interface AccessibilityViolation {
  id: string;
  impact: 'minor' | 'moderate' | 'serious' | 'critical';
  description: string;
  help: string;
  helpUrl: string;
  nodes: Array<{
    target: string[];
    html: string;
  }>;
}

export interface ImageAnalysis {
  totalImages: number;
  estimatedPhotos: number;
  estimatedIcons: number;
  imageUrls: string[];
  photoUrls: string[];
  iconUrls: string[];
  altStats: {
    withAlt: number;
    withoutAlt: number;
    emptyAlt: number;
    totalImages: number;
  };
}

/**
 * Unified UI Analysis result combining all UI-related data
 */
export interface UIAnalysis {
  colors: ColorResult[];
  fonts: FontResult[];
  images: ImageResult[];
  imageAnalysis: ImageAnalysis;
  contrastIssues: ContrastIssue[];
  violations: AccessibilityViolation[];
  accessibilityScore: number;
  schemaVersion: string;
  scrapedAt: string;
}

/**
 * Cache metadata for UI analysis
 */
export interface UIAnalysisCacheEntry {
  url: string;
  urlHash: string;
  analysis: UIAnalysis;
  createdAt: string;
  expiresAt: string;
}
/**
 * Unified type definitions for the website analysis tool
 * Phase 6: Type cleanup and security hardening
 */

import { UIScraperService } from '../server/services/uiScraper';

// Core UI Analysis types
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

export interface ColorResult {
  hex: string;
  name: string;
  usage?: string;
  property?: string;
  bucket?: string;
}

export interface FontResult {
  name: string;
  category: 'serif' | 'sans-serif' | 'monospace' | 'custom';
  usage: string;
  fallbacks: string[];
  weights?: number[];
  isSystemFont?: boolean;
}

export interface ImageResult {
  url: string;
  alt: string;
  width: number;
  height: number;
  type: 'photo' | 'icon' | 'logo';
  format: string;
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

export interface ContrastIssue {
  element: string;
  foregroundColor: string;
  backgroundColor: string;
  ratio: number;
  level: 'AA' | 'AAA';
  size: 'normal' | 'large';
}

export interface AccessibilityViolation {
  id: string;
  impact: 'minor' | 'moderate' | 'serious' | 'critical';
  description: string;
  help: string;
  helpUrl: string;
  nodes: Array<{
    html: string;
    target: string[];
  }>;
}

// SEO Analysis types
export interface SEOAnalysis {
  score: number | string;
  checks: SEOCheck[];
  recommendations: string[];
  metaTags: Record<string, string>;
  keywords: Array<{ keyword: string; density: number }>;
  headings: Array<{ level: number; text: string }>;
}

export interface SEOCheck {
  name: string;
  status: 'pass' | 'fail' | 'warning';
  description: string;
}

// Performance Analysis types
export interface PerformanceAnalysis {
  pageLoadTime: {
    desktop: number | string;
    mobile: number | string;
  };
  coreWebVitals: {
    lcpMs: number | string;
    inpMs: number | string;
    cls: number | string;
  };
}

// Tech Analysis types
export interface TechAnalysis {
  techStack: Array<{
    name: string;
    confidence: number;
    version?: string;
  }>;
  overallScore: number | string;
  minification: {
    css: boolean;
    js: boolean;
    html: boolean;
  };
  securityHeaders: Record<string, boolean | string>;
}

// Content Analysis types
export interface ContentAnalysis {
  wordCount: number | string;
  readabilityScore: number | string;
  contentDistribution: Record<string, number>;
  textElements?: string[];
}

// Overview aggregation type
export interface OverviewData {
  overallScore: number | string;
  seoScore: number | string;
  pageLoadTime: number | string;
  performanceScore: number | string;
  securityScore: number | string;
  accessibilityScore: number | string;
}

// Complete overview response type derived from service
export type OverviewResponse = {
  ui: UIAnalysis;
  seo: SEOAnalysis;
  perf: PerformanceAnalysis;
  tech: TechAnalysis;
  content: ContentAnalysis;
  overview: OverviewData;
  schemaVersion: string;
  generatedAt?: string;
};

// Legacy API response types removed

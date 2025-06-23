
export interface CoreWebVitals {
  lcp: number;
  fid: number;
  cls: number;
}

export interface SecurityHeaders {
  csp: string;
  hsts: string;
  xfo: string;
  xcto: string;
  referrer: string;
  [key: string]: string;
}

export interface AccessibilityViolation {
  id: string;
  impact?: string;
  description?: string;
}

export interface SocialMeta {
  hasOpenGraph: boolean;
  hasTwitterCard: boolean;
  hasShareButtons: boolean;
}

export interface CookieInfo {
  hasCookieScript: boolean;
  scripts: string[];
}

export interface MinificationInfo {
  cssMinified: boolean;
  jsMinified: boolean;
}

export interface LinkIssueInfo {
  brokenLinks: string[];
  mixedContentLinks: string[];
}

// New analysis data interfaces
export interface MobileResponsivenessData {
  score: number;
  issues: Array<{
    id: string;
    title: string;
    description: string;
  }>;
}

export interface SecurityScoreData {
  grade: string;
  findings: Array<{
    id: string;
    title: string;
    description: string;
  }>;
}

export interface AccessibilityData {
  violations: AccessibilityViolation[];
}

export interface HeaderChecksData {
  hsts: string;
  csp: string;
  frameOptions: string;
}

export type ComplianceStatus = 'pass' | 'fail' | 'warn';

export interface AnalysisResponse {
  id: string;
  url: string;
  timestamp: string;
  status: 'complete' | 'error';
  coreWebVitals: CoreWebVitals;
  securityHeaders: SecurityHeaders;
  performanceScore: number;
  seoScore: number;
  readabilityScore: number;
  complianceStatus: ComplianceStatus;
  // Add new analysis data properties
  mobileResponsiveness?: MobileResponsivenessData;
  securityScore?: SecurityScoreData;
  accessibility?: AccessibilityData;
  headerChecks?: HeaderChecksData;
  data: {
    overview: {
      overallScore: number;
      pageLoadTime: string;
      seoScore: number;
      userExperienceScore: number;
    };
    ui: {
      colors: Array<{
        name: string;
        hex: string;
        usage: string;
        count: number;
      }>;
      fonts: Array<{
        name: string;
        category: string;
        usage: string;
        weight: string;
      }>;
      images: Array<{
        type: string;
        count: number;
        format: string;
        totalSize: string;
      }>;
      imageAnalysis: {
        totalImages: number;
        estimatedPhotos: number;
        estimatedIcons: number;
        imageUrls: string[];
        photoUrls: string[];
        iconUrls: string[];
      };

      contrastIssues: Array<{
        textColor: string;
        backgroundColor: string;
        ratio: number;
      }>;

    };
    performance: {
      coreWebVitals: Array<{
        name: string;
        value: number;
        benchmark: number;
      }>;
      performanceScore: number;
      mobileResponsive: boolean;

      recommendations: Array<{
        type: 'error' | 'warning' | 'info';
        title: string;
        description: string;
      }>;
    };
    seo: {
      score: number;
      metaTags: Record<string, string>;

      checks: Array<{
        name: string;
        status: 'good' | 'warning' | 'error';
        description: string;
      }>;
      recommendations: Array<{
        title: string;
        description: string;
        priority: 'high' | 'medium' | 'low';
      }>;
    };
    technical: {
      techStack: Array<{
        category: string;
        technology: string;
      }>;
      healthGrade: string;
      issues: Array<{
        type: string;
        description: string;
        severity: 'high' | 'medium' | 'low';
        status: string;
      }>;

      securityScore: number;

      accessibility: {
        violations: AccessibilityViolation[];
      };
      social?: SocialMeta;
      cookies?: CookieInfo;
      minification?: MinificationInfo;
      linkIssues?: LinkIssueInfo;

    };
    adTags?: {
      hasGAM: boolean;
      hasAdSense: boolean;
      hasPrebid: boolean;
      hasAPS: boolean;
      hasIX: boolean;
      hasANX: boolean;
      hasOpenX: boolean;
      hasRubicon: boolean;
      hasPubMatic: boolean;
      hasVPAID: boolean;
      hasVMAP: boolean;
      hasIMA: boolean;
      hasCriteo: boolean;
      hasTaboola: boolean;
      hasOutbrain: boolean;
      hasSharethrough: boolean;
      hasTeads: boolean;
      hasMoat: boolean;
      hasDV: boolean;
      hasIAS: boolean;
    };
  };
}

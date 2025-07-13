


export interface CoreWebVitals {
  lcp: number;
  fid: number;
  cls: number;
  fcp: number;
  lcp_benchmark: number;
  fid_benchmark: number;
  cls_benchmark: number;
  fcp_benchmark: number;
}

export interface AccessibilityViolation {
  id: string;
  impact: string;
  description: string;
}

export interface ColorContrastIssue {
  element: string;
  fg: string;
  bg: string;
  ratio: number;
  expectedRatio?: number;
  suggestedColor?: string; // new
  isAccessible: boolean;
}

export interface SecurityHeaders {
  csp: string;
  hsts: string;
  xfo: string;
  xcto: string;
  referrer: string;
}

export interface AnalysisOverview {
  overallScore: number;
  pageLoadTime?: string;
  seoScore?: number;
  userExperienceScore?: number;
  colors?: string[];
  fonts?: string[];
  images?: string[];
  contrastIssues?: any[];
  [key: string]: any;
}

export interface AnalysisResponse {
  success: boolean;
  id?: string;
  url?: string;
  timestamp?: string;
  status?: string;
  coreWebVitals?: CoreWebVitals;
  securityHeaders?: SecurityHeaders;
  performanceScore?: number;
  seoScore?: number;
  readabilityScore?: number;
  complianceStatus?: string;
  mobileResponsiveness?: {
    score: number;
    issues: Array<{
      id: string;
      title: string;
      description: string;
    }>;
  };
  securityScore?: {
    grade: string;
    findings: Array<{
      id: string;
      title: string;
      description: string;
    }>;
  };
  accessibility?: {
    violations: any[];
  };
  headerChecks?: {
    hsts: string;
    csp: string;
    frameOptions: string;
  };
  data: {

    overview?: {
      overallScore: number;
      pageLoadTime?: string;
      seoScore?: number;
      userExperienceScore?: number;
      colors?: string[];
      fonts?: string[];
      images?: string[];
      imageAnalysis?: {
        totalImages: number;
        estimatedPhotos: number;
        estimatedIcons: number;
        imageUrls?: string[];
        photoUrls?: string[];
        iconUrls?: string[];
      };
      contrastIssues?: any[];
      [key: string]: any;
    };

    technical: {
      accessibility: {
        violations: Array<{
          id: string;
          description?: string;
        }>;
      };
      social?: {
        hasOpenGraph: boolean;
        hasTwitterCard: boolean;
        hasShareButtons: boolean;
      };
      cookies?: {
        hasCookieScript: boolean;
        scripts: string[];
      };
      minification?: {
        cssMinified: boolean;
        jsMinified: boolean;
      };
      linkIssues?: {
        brokenLinks: string[];
        mixedContentLinks: string[];
      };
      techStack?: any[];
      healthGrade?: string;
      issues?: any[];
      securityScore?: number;
    };
    performance: {
      performanceScore: number;
      coreWebVitals: CoreWebVitals[];
      mobileResponsive?: boolean;
      recommendations: Array<{
        title: string;
        description: string;
        type: string;
      }>;
    };
    ui?: {
      colors?: Array<{name: string, hex: string, usage: string, count: number}>;
      fonts?: Array<{name: string, category: string, usage: string, weight?: string, isLoaded?: boolean, isPublic?: boolean}>;
      images?: Array<{url: string, alt?: string, type?: string}>;
      imageAnalysis?: {
        totalImages: number;
        estimatedPhotos: number;
        estimatedIcons: number;
        imageUrls?: string[];
        photoUrls?: string[];
        iconUrls?: string[];
      };
      contrastIssues?: Array<{textColor: string, backgroundColor: string, ratio: number}>;
    };
    seo?: {
      score: number;
      checks: Array<{
        name: string;
        status: string;
        description: string;
      }>;
      recommendations: Array<{
        title: string;
        description: string;
        priority: string;
      }>;
      metaTags?: {
        title?: string;
        description?: string;
        canonical?: string;
        'og:title'?: string;
        'og:description'?: string;
        'og:image'?: string;
        'og:url'?: string;
        'og:type'?: string;
        'twitter:card'?: string;
        'twitter:title'?: string;
        'twitter:description'?: string;
        'twitter:image'?: string;
        keywords?: string;
        author?: string;
        robots?: string;
        [key: string]: any;
      };
      keywords?: Array<{
        keyword: string;
        count: number;
        density: number;
      }>;
      headings?: {
        h1: number;
        h2: number;
        h3: number;
        h4: number;
        h5: number;
        h6: number;
      };
      hasRobotsTxt?: boolean;
      hasSitemap?: boolean;
      structuredData?: Array<{
        type: string;
        data: any;
      }>;
    };
    adTags?: {
      [key: string]: boolean;
    };
    content?: {
      wordCount: number | string;
      readabilityScore: number | string;
    };
  };
  lhr: {
    categories: {
      security: {
        score: number;
        auditRefs: { id: string }[];
      };
      'best-practices'?: {
        auditRefs: { id: string }[];
      };
    };
    audits: Record<
      string,
      {
        score: number;
        title: string;
        description: string;
        numericValue?: number;
        details?: any;
      }
    >;
  };
}

export interface UIAnalysis {
  colors?: string[];
  fonts?: string[];
  images?: string[];
  imageAnalysis?: {
    totalImages: number;
    estimatedPhotos: number;
    estimatedIcons: number;
    imageUrls?: string[];
    photoUrls?: string[];
    iconUrls?: string[];
  };
  contrastIssues?: any[];
}



export interface AnalysisOverview {
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
}

export interface CoreWebVitals {
  lcp?: number;
  fid?: number;
  cls?: number;
  lcpMs?: number;
  inpMs?: number;
  tbt?: number;
  score?: number;
}

export interface SecurityHeaders {
  contentSecurityPolicy?: string;
  strictTransportSecurity?: string;
  xFrameOptions?: string;
  xContentTypeOptions?: string;
  xXSSProtection?: string;
  referrerPolicy?: string;
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
    overview?: AnalysisOverview;
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
      violations?: any[];
      accessibilityScore?: number;
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
        'twitter:site'?: string;
        'twitter:creator'?: string;
        keywords?: string;
        robots?: string;
        viewport?: string;
        charset?: string;
        [key: string]: any;
      };
      keywords?: Array<{
        word: string;
        count: number;
        density: number;
      }>;
    };
    performance?: {
      performanceScore: number;
      coreWebVitals: any;
      pageLoadTime?: { mobile: number; desktop: number };
      mobileResponsive?: boolean;
      recommendations: { title: string; description: string; type: string; }[];
    };
    tech?: any;
    content?: {
      wordCount: number;
      readabilityScore: number;
      contentDistribution: {
        headings: number;
        paragraphs: number;
        images: number;
        links: number;
      };
    };
    technical?: {
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
        htmlMinified?: boolean;
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
  };
}

export interface TechnicalAnalysis {
  techStack: Array<{
    name: string;
    category: string;
    confidence: number;
  }>;
  minification: {
    cssMinified: boolean;
    jsMinified: boolean;
    htmlMinified: boolean;
  };
  social: {
    hasOpenGraph: boolean;
    hasTwitterCard: boolean;
    hasShareButtons: boolean;
    facebookPixel: boolean;
    googleAnalytics: boolean;
    linkedInInsight: boolean;
  };
  cookies: {
    hasCookieScript: boolean;
    cookieConsentType: 'none' | 'basic' | 'advanced' | 'full';
  };
  adTags: Array<{
    name: string;
    type: string;
    found: boolean;
  }>;
  securityHeaders: {
    csp: string;
    hsts: string;
    xfo: string;
    xss: string;
    xcto: string;
    referrer: string;
  };
  tlsVersion: string;
  cdn: boolean;
  gzip: boolean;
  accessibility: {
    violations: any[];
  };
  issues: string[];
}
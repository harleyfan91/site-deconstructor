

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

export interface AnalysisResponse {
  success: boolean;
  url?: string;
  timestamp?: string;
  readabilityScore?: number;
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
    };
    performance: {
      performanceScore: number;
      coreWebVitals: CoreWebVitals[];
      recommendations: Array<{
        title: string;
        description: string;
        type: string;
      }>;
    };
    ui?: {
      colors?: any[];
      fonts?: any[];
      images?: any[];
      imageAnalysis?: {
        totalImages: number;
        estimatedPhotos: number;
        estimatedIcons: number;
      };
      contrastIssues?: any[];
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
        [key: string]: any;
      };
    };
    adTags?: {
      [key: string]: boolean;
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


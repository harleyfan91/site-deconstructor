export interface CoreWebVitals {
  lcp: number;
  fid: number;
  cls: number;
}

export interface SecurityHeaders {
  csp: string;
  hsts: string;
  [key: string]: string;
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
    };
    performance: {
      coreWebVitals: Array<{
        name: string;
        value: number;
        benchmark: number;
      }>;
      performanceScore: number;
      recommendations: Array<{
        type: 'error' | 'warning' | 'info';
        title: string;
        description: string;
      }>;
    };
    seo: {
      score: number;
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

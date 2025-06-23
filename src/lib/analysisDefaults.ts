
import { AnalysisResponse } from '@/types/analysis';

export function createDefaultAnalysis(url: string): AnalysisResponse {
  return {
    success: true,
    id: 'default',
    url,
    timestamp: new Date().toISOString(),
    status: 'complete',
    coreWebVitals: { 
      lcp: 0, 
      fid: 0, 
      cls: 0,
      fcp: 0,
      lcp_benchmark: 0,
      fid_benchmark: 0,
      cls_benchmark: 0,
      fcp_benchmark: 0
    },
    securityHeaders: { csp: '', hsts: '', xfo: '', xcto: '', referrer: '' },
    performanceScore: 0,
    seoScore: 0,
    readabilityScore: 0,
    complianceStatus: 'warn',
    data: {
      overview: {
        overallScore: 0,
        pageLoadTime: '',
        seoScore: 0,
        userExperienceScore: 0,
      },
      ui: {
        colors: [
          { name: 'Primary Text', hex: '#000000', usage: 'Text', count: 0 },
          { name: 'Background', hex: '#FFFFFF', usage: 'Background', count: 0 },
        ],
        fonts: [],
        images: [],
        imageAnalysis: {
          totalImages: 0,
          estimatedPhotos: 0,
          estimatedIcons: 0,
          imageUrls: [],
          photoUrls: [],
          iconUrls: [],
        },
        contrastIssues: [],
      },
      performance: {
        coreWebVitals: [],
        performanceScore: 0,
        mobileResponsive: false,
        recommendations: [],
      },
      seo: {
        score: 0,
        metaTags: {},
        checks: [],
        recommendations: [],
      },
      technical: {
        techStack: [],
        healthGrade: '',
        issues: [],
        securityScore: 0,
        accessibility: { violations: [] },
        social: { hasOpenGraph: false, hasTwitterCard: false, hasShareButtons: false },
        cookies: { hasCookieScript: false, scripts: [] },
        minification: { cssMinified: false, jsMinified: false },
        linkIssues: { brokenLinks: [], mixedContentLinks: [] },
      },
      adTags: {
        hasGAM: false,
        hasAdSense: false,
        hasPrebid: false,
        hasAPS: false,
        hasIX: false,
        hasANX: false,
        hasOpenX: false,
        hasRubicon: false,
        hasPubMatic: false,
        hasVPAID: false,
        hasVMAP: false,
        hasIMA: false,
        hasCriteo: false,
        hasTaboola: false,
        hasOutbrain: false,
        hasSharethrough: false,
        hasTeads: false,
        hasMoat: false,
        hasDV: false,
        hasIAS: false,
      },
    },
    lhr: {
      categories: {
        security: {
          score: 0,
          auditRefs: [],
        },
      },
      audits: {},
    },
  };
}

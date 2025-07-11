/**
 * Enhanced Tech Analysis combining lightweight detection with Lighthouse Best Practices
 * Populates Tech tab with real data from multiple sources
 */
import { getLighthouseBestPractices, type LighthouseBestPracticesData } from './lighthouse-service';
import { getTechnicalAnalysis as getLightweightTech } from './tech-lightweight';
import { SupabaseCacheService } from './supabase';
import * as crypto from 'crypto';

export interface EnhancedTechAnalysis {
  // Core tech stack from lightweight analysis
  techStack: Array<{
    category: string;
    technology: string;
    version?: string;
    confidence?: number;
  }>;
  
  // Security from both sources
  securityHeaders: {
    csp: string;
    hsts: string;
    xfo: string;
    xss: string;
    xcto: string;
    referrer: string;
  };
  
  // Performance optimizations from Lighthouse
  performance: {
    usesHttp2: boolean;
    usesTextCompression: boolean;
    usesOptimizedImages: boolean;
    usesWebpImages: boolean;
    usesResponsiveImages: boolean;
    efficientAnimatedContent: boolean;
  };
  
  // Best practices from Lighthouse
  bestPractices: {
    hasDoctype: boolean;
    hasCharset: boolean;
    noDocumentWrite: boolean;
    noGeolocationOnStart: boolean;
    noNotificationOnStart: boolean;
    noVulnerableLibraries: boolean;
    noUnloadListeners: boolean;
    cspXss: boolean;
  };
  
  // Minification from lightweight analysis
  minification: {
    cssMinified: boolean;
    jsMinified: boolean;
    htmlMinified: boolean;
  };
  
  // Social analysis from lightweight
  social: {
    hasOpenGraph: boolean;
    hasTwitterCard: boolean;
    hasShareButtons: boolean;
    facebookPixel?: boolean;
    googleAnalytics?: boolean;
    linkedInInsight?: boolean;
  };
  
  // Cookie analysis from lightweight
  cookies: {
    hasSessionCookies: boolean;
    hasTrackingCookies: boolean;
    hasAnalyticsCookies: boolean;
    hasCookieScript?: boolean;
    cookieConsentType?: 'none' | 'banner' | 'popup' | 'overlay';
    cookieLibrary?: string;
  };
  
  // Ad tags from lightweight
  adTags: {
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
    hasCriteo: boolean;
    hasTaboola: boolean;
    hasOutbrain: boolean;
    hasSharethrough: boolean;
    hasTeads: boolean;
    hasMoat: boolean;
    hasDV: boolean;
    hasIAS: boolean;
    // Enhanced tracking pixels
    hasGA4: boolean;
    hasGTM: boolean;
    hasMetaPixel: boolean;
    hasLinkedInInsight: boolean;
    hasTikTokPixel: boolean;
    hasTwitterPixel: boolean;
  };
  
  // Combined issues and recommendations
  issues: Array<{
    type: string;
    description: string;
    severity: string;
    recommendation: string;
    source: 'lighthouse' | 'lightweight';
  }>;
  
  // Overall scores
  lighthouseScore: number;
  overallScore: number;
  
  // Additional metadata
  tlsVersion: string;
  cdn: boolean;
  gzip: boolean;
}

export async function getEnhancedTechAnalysis(url: string): Promise<EnhancedTechAnalysis> {
  try {
    const urlHash = crypto.createHash('sha256').update(url).digest('hex');
    const cacheKey = `enhanced_tech_${urlHash}`;

    // Try cache first
    const cached = await SupabaseCacheService.get(cacheKey);
    if (cached) {
      console.log('📦 Enhanced tech analysis cache hit');
      return cached.analysis_data;
    }

    console.log('🔍 Performing enhanced tech analysis (lightweight + Lighthouse)...');
    
    // Run lightweight first, then Lighthouse to avoid concurrency issues
    console.log('🔍 Running lightweight tech analysis...');
    const lightweightData = await getLightweightTech(url);
    
    console.log('🔍 Running Lighthouse Best Practices analysis...');
    let lighthouseData;
    try {
      lighthouseData = await getLighthouseBestPractices(url);
    } catch (lighthouseError) {
      const errorMessage = lighthouseError instanceof Error ? lighthouseError.message : 'Unknown error';
      console.warn('Lighthouse Best Practices failed, using lightweight data only:', errorMessage);
      // Return enhanced analysis with just lightweight data
      return {
        ...lightweightData,
        // Default lighthouse values
        performance: {
          usesHttp2: false,
          usesTextCompression: !!lightweightData.gzip,
          usesOptimizedImages: false,
          usesWebpImages: false,
          usesResponsiveImages: false,
          efficientAnimatedContent: false,
        },
        bestPractices: {
          hasDoctype: true,
          hasCharset: true,
          noDocumentWrite: true,
          noGeolocationOnStart: true,
          noNotificationOnStart: true,
          noVulnerableLibraries: true,
          noUnloadListeners: true,
          cspXss: lightweightData.securityHeaders.csp !== 'Not Set',
        },
        // Generate cookie analysis based on detected analytics
        cookies: {
          hasSessionCookies: true, // Most websites have session cookies
          hasTrackingCookies: lightweightData.social?.googleAnalytics || lightweightData.social?.facebookPixel || false,
          hasAnalyticsCookies: lightweightData.social?.googleAnalytics || lightweightData.social?.facebookPixel || false,
          hasCookieScript: lightweightData.social?.googleAnalytics || lightweightData.social?.facebookPixel || false,
          cookieConsentType: (lightweightData.social?.googleAnalytics || lightweightData.social?.facebookPixel) ? 'banner' : 'none' as const,
          cookieLibrary: lightweightData.social?.googleAnalytics ? 'Google Analytics' : undefined
        },
        // Use real ad tag analysis from lightweight detection
        adTags: {
          hasGAM: lightweightData.adTags?.hasGAM || false,
          hasAdSense: lightweightData.adTags?.hasAdSense || false,
          hasPrebid: lightweightData.adTags?.hasPrebid || false,
          hasAPS: lightweightData.adTags?.hasAPS || false,
          hasIX: lightweightData.adTags?.hasIX || false,
          hasANX: lightweightData.adTags?.hasANX || false,
          hasOpenX: lightweightData.adTags?.hasOpenX || false,
          hasRubicon: lightweightData.adTags?.hasRubicon || false,
          hasPubMatic: lightweightData.adTags?.hasPubMatic || false,
          hasVPAID: lightweightData.adTags?.hasVPAID || false,
          hasCriteo: lightweightData.adTags?.hasCriteo || false,
          hasTaboola: lightweightData.adTags?.hasTaboola || false,
          hasOutbrain: lightweightData.adTags?.hasOutbrain || false,
          hasSharethrough: lightweightData.adTags?.hasSharethrough || false,
          hasTeads: lightweightData.adTags?.hasTeads || false,
          hasMoat: lightweightData.adTags?.hasMoat || false,
          hasDV: lightweightData.adTags?.hasDV || false,
          hasIAS: lightweightData.adTags?.hasIAS || false,
          // Enhanced tracking pixels
          hasGA4: lightweightData.adTags?.hasGA4 || false,
          hasGTM: lightweightData.adTags?.hasGTM || false,
          hasMetaPixel: lightweightData.adTags?.hasMetaPixel || false,
          hasLinkedInInsight: lightweightData.adTags?.hasLinkedInInsight || false,
          hasTikTokPixel: lightweightData.adTags?.hasTikTokPixel || false,
          hasTwitterPixel: lightweightData.adTags?.hasTwitterPixel || false
        },
        issues: lightweightData.issues.map(issue => ({ ...issue, source: 'lightweight' as const })),
        lighthouseScore: 0,
        overallScore: calculateLightweightScore(lightweightData)
      };
    }

    // Combine and enhance the data
    const enhancedAnalysis: EnhancedTechAnalysis = {
      // Use lightweight tech stack detection
      techStack: lightweightData.techStack,
      
      // Combine security headers (Lighthouse provides more detailed analysis)
      securityHeaders: {
        ...lightweightData.securityHeaders,
        // Override with Lighthouse data if available
        csp: lighthouseData.audits.cspXss?.displayValue || lightweightData.securityHeaders.csp,
      },
      
      // Performance data from Lighthouse
      performance: {
        usesHttp2: lighthouseData.audits.usesHttp2?.score === 1,
        usesTextCompression: lighthouseData.audits.usesTextCompression?.score === 1,
        usesOptimizedImages: lighthouseData.audits.usesOptimizedImages?.score === 1,
        usesWebpImages: lighthouseData.audits.usesWebpImages?.score === 1,
        usesResponsiveImages: lighthouseData.audits.usesResponsiveImages?.score === 1,
        efficientAnimatedContent: lighthouseData.audits.efficientAnimatedContent?.score === 1,
      },
      
      // Best practices from Lighthouse
      bestPractices: {
        hasDoctype: lighthouseData.audits.doctype?.score === 1,
        hasCharset: lighthouseData.audits.charset?.score === 1,
        noDocumentWrite: lighthouseData.audits.noDocumentWrite?.score === 1,
        noGeolocationOnStart: lighthouseData.audits.geolocationOnStart?.score === 1,
        noNotificationOnStart: lighthouseData.audits.notificationOnStart?.score === 1,
        noVulnerableLibraries: lighthouseData.audits.vulnerabilities?.score === 1,
        noUnloadListeners: lighthouseData.audits.noUnloadListeners?.score === 1,
        cspXss: lighthouseData.audits.cspXss?.score === 1,
      },
      
      // Use lightweight minification detection
      minification: lightweightData.minification,
      
      // Use lightweight social analysis
      social: lightweightData.social,
      
      // Generate cookie analysis based on detected analytics
      cookies: {
        hasSessionCookies: true, // Most websites have session cookies
        hasTrackingCookies: lightweightData.social?.googleAnalytics || lightweightData.social?.facebookPixel || false,
        hasAnalyticsCookies: lightweightData.social?.googleAnalytics || lightweightData.social?.facebookPixel || false,
        hasCookieScript: lightweightData.social?.googleAnalytics || lightweightData.social?.facebookPixel || false,
        cookieConsentType: (lightweightData.social?.googleAnalytics || lightweightData.social?.facebookPixel) ? 'banner' : 'none' as const,
        cookieLibrary: lightweightData.social?.googleAnalytics ? 'Google Analytics' : undefined
      },
      
      // Generate basic ad tag analysis (lightweight doesn't provide this)
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
        hasCriteo: false,
        hasTaboola: false,
        hasOutbrain: false,
        hasSharethrough: false,
        hasTeads: false,
        hasMoat: false,
        hasDV: false,
        hasIAS: false
      },
      
      // Combine issues from both sources
      issues: [
        ...lightweightData.issues.map(issue => ({ ...issue, source: 'lightweight' as const })),
        ...generateLighthouseIssues(lighthouseData)
      ],
      
      // Scores
      lighthouseScore: lighthouseData.score,
      overallScore: Math.round((lighthouseData.score + calculateLightweightScore(lightweightData)) / 2),
      
      // Additional metadata from lightweight analysis
      tlsVersion: lightweightData.tlsVersion,
      cdn: lightweightData.cdn,
      gzip: lightweightData.gzip
    };

    // Cache the results
    await SupabaseCacheService.set(cacheKey, url, enhancedAnalysis);
    
    console.log(`✅ Enhanced tech analysis completed: Lighthouse score ${lighthouseData.score}, Overall score ${enhancedAnalysis.overallScore}`);
    
    return enhancedAnalysis;
  } catch (error) {
    console.error('Enhanced tech analysis error:', error);
    throw error;
  }
}

function generateLighthouseIssues(lighthouseData: LighthouseBestPracticesData): Array<{
  type: string;
  description: string;
  severity: string;
  recommendation: string;
  source: 'lighthouse';
}> {
  const issues: Array<{
    type: string;
    description: string;
    severity: string;
    recommendation: string;
    source: 'lighthouse';
  }> = [];
  
  // Check for failed audits and create issues
  if (lighthouseData.audits.isOnHttps?.score !== 1) {
    issues.push({
      type: 'security',
      description: 'Website not served over HTTPS',
      severity: 'high',
      recommendation: 'Configure HTTPS to ensure secure data transmission',
      source: 'lighthouse' as const
    });
  }
  
  if (lighthouseData.audits.usesHttp2?.score !== 1) {
    issues.push({
      type: 'performance',
      description: 'Website not using HTTP/2',
      severity: 'medium',
      recommendation: 'Enable HTTP/2 to improve performance',
      source: 'lighthouse' as const
    });
  }
  
  if (lighthouseData.audits.usesTextCompression?.score !== 1) {
    issues.push({
      type: 'performance',
      description: 'Text compression not enabled',
      severity: 'medium',
      recommendation: 'Enable gzip or brotli compression for text resources',
      source: 'lighthouse' as const
    });
  }
  
  if (lighthouseData.audits.vulnerabilities?.score !== 1) {
    issues.push({
      type: 'security',
      description: 'Vulnerable JavaScript libraries detected',
      severity: 'high',
      recommendation: 'Update vulnerable JavaScript libraries to latest versions',
      source: 'lighthouse' as const
    });
  }
  
  if (lighthouseData.audits.cspXss?.score !== 1) {
    issues.push({
      type: 'security',
      description: 'Content Security Policy missing or inadequate',
      severity: 'medium',
      recommendation: 'Implement a strong Content Security Policy to prevent XSS attacks',
      source: 'lighthouse' as const
    });
  }
  
  return issues;
}

function calculateLightweightScore(lightweightData: any): number {
  let score = 100;
  
  // Deduct points for missing security headers
  if (lightweightData.securityHeaders.csp === 'Not Set') score -= 10;
  if (lightweightData.securityHeaders.hsts === 'Not Set') score -= 10;
  if (lightweightData.securityHeaders.xfo === 'Not Set') score -= 5;
  if (lightweightData.securityHeaders.xcto === 'Not Set') score -= 5;
  
  // Deduct points for missing compression
  if (!lightweightData.gzip) score -= 10;
  
  // Deduct points for issues
  score -= lightweightData.issues.length * 5;
  
  return Math.max(0, score);
}

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Helper function to map score to letter grade
function mapScoreToGrade(score: number): string {
  if (score >= 90) return 'A';
  if (score >= 80) return 'B';
  if (score >= 70) return 'C';
  if (score >= 60) return 'D';
  return 'F';
}

interface AnalysisResult {
  mobileResponsiveness: {
    score: number;
    issues: Array<{
      id: string;
      title: string;
      description: string;
    }>;
  };
  securityScore: {
    grade: string;
    findings: Array<{
      id: string;
      title: string;
      description: string;
    }>;
  };
  accessibility: {
    violations: any[];
  };
  headerChecks: {
    hsts: string;
    csp: string;
    frameOptions: string;
  };
}

export async function analyze(url: string): Promise<AnalysisResult> {
  console.log(`Starting analysis for: ${url}`);
  
  try {
    // For now, let's use a simplified approach that doesn't rely on external tools
    // This will provide mock data while we work on the implementation
    
    // Fetch the page to get basic information
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; WebsiteAnalyzer/1.0)',
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch ${url}: ${response.status}`);
    }

    const html = await response.text();
    
    // Basic mobile responsiveness check
    const hasViewportMeta = html.includes('viewport');
    const hasResponsiveCSS = html.includes('max-width') || html.includes('min-width');
    const mobileScore = (hasViewportMeta ? 50 : 0) + (hasResponsiveCSS ? 50 : 0);
    
    const mobileIssues = [];
    if (!hasViewportMeta) {
      mobileIssues.push({
        id: 'viewport-meta',
        title: 'Missing Viewport Meta Tag',
        description: 'Page does not have a viewport meta tag for mobile optimization'
      });
    }
    if (!hasResponsiveCSS) {
      mobileIssues.push({
        id: 'responsive-css',
        title: 'No Responsive CSS Detected',
        description: 'Page may not have responsive CSS rules'
      });
    }

    // Basic security checks
    const hasHTTPS = url.startsWith('https://');
    const securityScore = hasHTTPS ? 80 : 40;
    
    const securityFindings = [];
    if (!hasHTTPS) {
      securityFindings.push({
        id: 'no-https',
        title: 'No HTTPS',
        description: 'Website is not using HTTPS encryption'
      });
    }

    // Basic accessibility checks
    const hasAltTags = html.includes('alt=');
    const accessibilityViolations = [];
    if (!hasAltTags) {
      accessibilityViolations.push({
        id: 'images-alt',
        impact: 'serious',
        description: 'Images may be missing alt attributes'
      });
    }

    // Header checks
    const headerChecks = {
      hsts: response.headers.get('strict-transport-security') || 'missing',
      csp: response.headers.get('content-security-policy') || 'missing',
      frameOptions: response.headers.get('x-frame-options') || 'missing'
    };

    console.log(`Analysis completed for ${url}`);

    return {
      mobileResponsiveness: {
        score: mobileScore,
        issues: mobileIssues
      },
      securityScore: {
        grade: mapScoreToGrade(securityScore),
        findings: securityFindings
      },
      accessibility: {
        violations: accessibilityViolations
      },
      headerChecks
    };

  } catch (error) {
    console.error('Analysis error:', error);
    
    // Return fallback data on error
    return {
      mobileResponsiveness: {
        score: 0,
        issues: [{
          id: 'analysis-error',
          title: 'Analysis Error',
          description: 'Unable to complete mobile responsiveness analysis'
        }]
      },
      securityScore: {
        grade: 'F',
        findings: [{
          id: 'analysis-error',
          title: 'Analysis Error',
          description: 'Unable to complete security analysis'
        }]
      },
      accessibility: {
        violations: [{
          id: 'analysis-error',
          impact: 'serious',
          description: 'Unable to complete accessibility analysis'
        }]
      },
      headerChecks: {
        hsts: 'error',
        csp: 'error',
        frameOptions: 'error'
      }
    };
  }
}

// Deno serve handler for the edge function
serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const targetUrl = url.searchParams.get('url');
    
    if (!targetUrl) {
      return new Response(
        JSON.stringify({ error: 'URL parameter is required' }),
        { 
          status: 400,
          headers: { 'Content-Type': 'application/json', ...corsHeaders }
        }
      );
    }

    console.log(`Analyzing URL: ${targetUrl}`);
    const result = await analyze(targetUrl);
    
    return new Response(
      JSON.stringify(result),
      { 
        status: 200,
        headers: { 'Content-Type': 'application/json', ...corsHeaders }
      }
    );
    
  } catch (error) {
    console.error('Edge function error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { 
        status: 500,
        headers: { 'Content-Type': 'application/json', ...corsHeaders }
      }
    );
  }
});

// Export for testing purposes
export { mapScoreToGrade };

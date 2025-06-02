
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

// CORS headers for frontend communication
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
}

// Security headers
const securityHeaders = {
  'Content-Security-Policy': "default-src 'self'",
  'X-Frame-Options': 'DENY',
  'X-Content-Type-Options': 'nosniff',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
}

// URL validation schema
const urlValidation = (url: string): { isValid: boolean; error?: string } => {
  try {
    const parsed = new URL(url);
    if (!['http:', 'https:'].includes(parsed.protocol)) {
      return { isValid: false, error: 'Only HTTP and HTTPS protocols are allowed' };
    }
    return { isValid: true };
  } catch (error) {
    return { isValid: false, error: 'Invalid URL format' };
  }
};

// Sample response data matching the expected structure
const generateSampleAnalysisData = (url: string) => ({
  id: crypto.randomUUID(),
  url: url,
  timestamp: new Date().toISOString(),
  status: 'complete' as const,
  data: {
    overview: {
      overallScore: 78,
      pageLoadTime: '2.3s',
      seoScore: 85,
      userExperienceScore: 72,
    },
    ui: {
      colors: [
        { name: 'Primary Blue', hex: '#007bff', usage: 'Navigation and CTAs' },
        { name: 'Dark Gray', hex: '#343a40', usage: 'Text content' },
        { name: 'Light Gray', hex: '#f8f9fa', usage: 'Background sections' },
      ],
      fonts: [
        { name: 'Inter', category: 'Sans-serif', usage: 'Body text', weight: '400' },
        { name: 'Inter', category: 'Sans-serif', usage: 'Headings', weight: '600' },
      ],
      images: [
        { type: 'Logo', count: 1, format: 'SVG', totalSize: '2.4 KB' },
        { type: 'Photos', count: 5, format: 'WebP', totalSize: '156 KB' },
        { type: 'Icons', count: 12, format: 'SVG', totalSize: '8.2 KB' },
      ],
    },
    performance: {
      coreWebVitals: [
        { name: 'Largest Contentful Paint', value: 2.1, benchmark: 2.5 },
        { name: 'First Input Delay', value: 85, benchmark: 100 },
        { name: 'Cumulative Layout Shift', value: 0.08, benchmark: 0.1 },
      ],
      performanceScore: 82,
      recommendations: [
        {
          type: 'warning' as const,
          title: 'Optimize Images',
          description: 'Consider using WebP format for better compression',
        },
        {
          type: 'info' as const,
          title: 'Enable Text Compression',
          description: 'Enable Gzip compression to reduce file sizes',
        },
      ],
    },
    seo: {
      score: 85,
      checks: [
        { name: 'Title Tag', status: 'good' as const, description: 'Page has a descriptive title' },
        { name: 'Meta Description', status: 'good' as const, description: 'Meta description is present and optimal length' },
        { name: 'Headings Structure', status: 'warning' as const, description: 'Missing H1 tag on the page' },
        { name: 'Image Alt Text', status: 'error' as const, description: '3 images missing alt text' },
      ],
      recommendations: [
        {
          title: 'Add H1 Tag',
          description: 'Include a single H1 tag that describes the main content',
          priority: 'high' as const,
        },
        {
          title: 'Fix Image Alt Text',
          description: 'Add descriptive alt text to all images for accessibility',
          priority: 'medium' as const,
        },
      ],
    },
    technical: {
      techStack: [
        { category: 'Framework', technology: 'React' },
        { category: 'CSS Framework', technology: 'Material-UI' },
        { category: 'Build Tool', technology: 'Vite' },
        { category: 'Hosting', technology: 'Vercel' },
      ],
      healthGrade: 'B+',
      issues: [
        {
          type: 'Performance',
          description: 'Large bundle size detected',
          severity: 'medium' as const,
          status: 'Open',
        },
        {
          type: 'Accessibility',
          description: 'Missing ARIA labels on interactive elements',
          severity: 'high' as const,
          status: 'Open',
        },
      ],
    },
  },
});

// Rate limiting function
const checkRateLimit = async (supabase: any, ipAddress: string): Promise<{ allowed: boolean; resetTime?: number }> => {
  const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();
  
  // Clean up old rate limit entries
  await supabase
    .from('rate_limits')
    .delete()
    .lt('window_start', oneHourAgo);

  // Get current rate limit for IP
  const { data: rateLimit } = await supabase
    .from('rate_limits')
    .select('*')
    .eq('ip_address', ipAddress)
    .single();

  if (!rateLimit) {
    // First request from this IP
    await supabase
      .from('rate_limits')
      .insert({
        ip_address: ipAddress,
        request_count: 1,
        window_start: new Date().toISOString()
      });
    return { allowed: true };
  }

  if (rateLimit.request_count >= 30) {
    const resetTime = new Date(rateLimit.window_start).getTime() + (60 * 60 * 1000);
    return { allowed: false, resetTime };
  }

  // Increment request count
  await supabase
    .from('rate_limits')
    .update({ request_count: rateLimit.request_count + 1 })
    .eq('ip_address', ipAddress);

  return { allowed: true };
};

// Logging function
const logRequest = async (supabase: any, ipAddress: string, urlParam: string, status: number, errorMessage?: string) => {
  await supabase
    .from('api_logs')
    .insert({
      ip_address: ipAddress,
      url_parameter: urlParam,
      response_status: status,
      error_message: errorMessage,
    });
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { 
      headers: { ...corsHeaders, ...securityHeaders },
      status: 200 
    });
  }

  // Initialize Supabase client
  const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
  const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
  const supabase = createClient(supabaseUrl, supabaseKey);

  // Get client IP address
  const ipAddress = req.headers.get('x-forwarded-for') || 
                   req.headers.get('x-real-ip') || 
                   'unknown';

  try {
    // Only allow GET requests
    if (req.method !== 'GET') {
      await logRequest(supabase, ipAddress, '', 405, 'Method not allowed');
      return new Response(
        JSON.stringify({ error: 'Method not allowed' }),
        { 
          status: 405, 
          headers: { ...corsHeaders, ...securityHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    // Check rate limiting
    const rateLimitCheck = await checkRateLimit(supabase, ipAddress);
    if (!rateLimitCheck.allowed) {
      await logRequest(supabase, ipAddress, '', 429, 'Rate limit exceeded');
      return new Response(
        JSON.stringify({ 
          error: 'Rate limit exceeded. Maximum 30 requests per hour.',
          resetTime: rateLimitCheck.resetTime 
        }),
        { 
          status: 429,
          headers: { 
            ...corsHeaders, 
            ...securityHeaders, 
            'Content-Type': 'application/json',
            'Retry-After': '3600'
          }
        }
      );
    }

    // Extract and validate URL parameter
    const url = new URL(req.url);
    const targetUrl = url.searchParams.get('url');

    if (!targetUrl) {
      await logRequest(supabase, ipAddress, '', 400, 'Missing url parameter');
      return new Response(
        JSON.stringify({ error: 'Missing required parameter: url' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, ...securityHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    // Validate URL format
    const validation = urlValidation(targetUrl);
    if (!validation.isValid) {
      await logRequest(supabase, ipAddress, targetUrl, 400, validation.error);
      return new Response(
        JSON.stringify({ error: validation.error }),
        { 
          status: 400, 
          headers: { ...corsHeaders, ...securityHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    // Generate sample analysis data
    const analysisData = generateSampleAnalysisData(targetUrl);

    // Log successful request
    await logRequest(supabase, ipAddress, targetUrl, 200);

    // Return sample response
    return new Response(
      JSON.stringify(analysisData),
      { 
        status: 200, 
        headers: { ...corsHeaders, ...securityHeaders, 'Content-Type': 'application/json' }
      }
    );

  } catch (error) {
    console.error('API Error:', error);
    await logRequest(supabase, ipAddress, '', 500, error.message);
    
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { 
        status: 500, 
        headers: { ...corsHeaders, ...securityHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});

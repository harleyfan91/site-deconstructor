
import React, { useState, useEffect } from 'react';
import { Box, Typography, Card, CardContent, Chip, CircularProgress, Alert, Tooltip } from '@mui/material';
import { Shield, Globe, Server, Database, Code, Layers, Zap, Activity, BarChart, Users, Cookie, Settings } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import type { AnalysisResponse } from '@/types/analysis';
import TechStackGrid from './TechStackGrid';
import LegendContainer from './LegendContainer';
import { useTheme } from '@mui/material/styles';

/** ===========================
 *  Helpers and constants
 *  =========================== */

/** Return color by severity (used in chips). */
function getSeverityColor(severity: string, theme: any): string {
  switch (severity.toLowerCase()) {
    case 'high': return theme.palette.error.main;
    case 'medium': return theme.palette.warning.main;
    case 'low': return theme.palette.success.main;
    default: return theme.palette.grey[400]; // Was theme.palette.neutral?.main
  }
}

/** Generate Chip styling props for severity. */
function chipSeverityStyle(severity: string, theme: any) {
  const color = getSeverityColor(severity, theme);
  return {
    variant: "outlined" as const,
    sx: {
      borderColor: color,
      color,
      background: "transparent",
      fontWeight: 600,
      height: 22,
      fontSize: '0.82rem'
    }
  };
}

/** Generate Chip styling props for isActive state (used for active/inactive chips). */
function chipStateStyle(isActive: boolean, theme: any) {
  return isActive
    ? {
        variant: "outlined" as const,
        sx: {
          borderColor: theme.palette.success.main,
          color: theme.palette.success.main,
          background: "transparent",
          fontWeight: 600,
        }
      }
    : {
        variant: "outlined" as const,
        color: "default" as const,
        sx: {
          borderColor: theme.palette.grey[400], // Was theme.palette.neutral?.main
          color: theme.palette.grey[400],
          background: "transparent",
          fontWeight: 600,
        }
      }
}

/** Get health grade color for display. */
function getHealthGradeColor(grade: string): string {
  if (grade.startsWith('A')) return '#4CAF50';
  if (grade.startsWith('B')) return '#8BC34A';
  if (grade.startsWith('C')) return '#FF9800';
  return '#F44336';
}

/** =============
 *  Sub-components
 *  ==============
 */

// Descriptor for ad tag detection chips
const adTagDescriptors = [
  { label: 'Google GAM/GPT', key: 'hasGAM' },
  { label: 'AdSense/DFP', key: 'hasAdSense' },
  { label: 'Prebid.js', key: 'hasPrebid' },
  { label: 'Amazon Publisher Services', key: 'hasAPS' },
  { label: 'Index Exchange', key: 'hasIX' },
  { label: 'AppNexus/Xandr', key: 'hasANX' },
  { label: 'OpenX', key: 'hasOpenX' },
  { label: 'Rubicon', key: 'hasRubicon' },
  { label: 'PubMatic', key: 'hasPubMatic' },
  { label: 'VPAID/VMAP/IMA', key: 'hasVPAID' },
  { label: 'Criteo', key: 'hasCriteo' },
  { label: 'Taboola', key: 'hasTaboola' },
  { label: 'Outbrain', key: 'hasOutbrain' },
  { label: 'Sharethrough', key: 'hasSharethrough' },
  { label: 'Teads', key: 'hasTeads' },
  { label: 'Moat', key: 'hasMoat' },
  { label: 'DoubleVerify', key: 'hasDV' },
  { label: 'Integral Ad Science', key: 'hasIAS' }
];

/**
 * Technical health summary sidebar
 */
function TechnicalHealthSummary({ healthGrade, issues }: { healthGrade: string, issues: any[] }) {
  // Count issues by severity
  const highCount = (issues ?? []).filter(i => i.severity === 'high').length;
  const mediumCount = (issues ?? []).filter(i => i.severity === 'medium').length;
  const lowCount = (issues ?? []).filter(i => i.severity === 'low').length;

  return (
    <Card sx={{ borderRadius: 2 }}>
      <CardContent sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
          <Activity size={24} color="#FF6B35" style={{ marginRight: 8 }} />
          <Typography 
            variant="h6" 
            sx={{ 
              fontWeight: 'bold',
              fontSize: { xs: '1.1rem', sm: '1.25rem' }
            }}
          >
            Technical Health
          </Typography>
        </Box>
        <Box sx={{ mb: 3 }}>
          <Typography variant="h3" sx={{
            fontWeight: 'bold',
            color: getHealthGradeColor(healthGrade),
            textAlign: 'center'
          }}>
            {healthGrade}
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center' }}>
            Technical Health Grade
          </Typography>
        </Box>
        <Box>
          <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mb: 2 }}>
            Issue Summary
          </Typography>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
            <Typography variant="body2">High Severity</Typography>
            <Typography variant="body2" sx={{ fontWeight: 'bold', color: '#F44336' }}>
              {highCount}
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
            <Typography variant="body2">Medium Severity</Typography>
            <Typography variant="body2" sx={{ fontWeight: 'bold', color: '#FF9800' }}>
              {mediumCount}
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
            <Typography variant="body2">Low Severity</Typography>
            <Typography variant="body2" sx={{ fontWeight: 'bold', color: '#4CAF50' }}>
              {lowCount}
            </Typography>
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
}

/** ========================
 *    MAIN COMPONENT EXPORT
 *  ========================
 */

/** Props type for TechTab main component */
interface TechTabProps {
  data: AnalysisResponse | null;
  loading: boolean;
  error: string | null;
}

/** Interface for comprehensive technical analysis data */
interface TechnicalAnalysis {
  techStack: Array<{
    category: string;
    technology: string;
    version?: string;
    confidence?: number;
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
    cookieConsentType: 'none' | 'banner' | 'popup' | 'overlay';
    cookieLibrary?: string;
  };
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
  };
  securityHeaders: {
    csp: string;
    hsts: string;
    xfo: string;
    xss: string;
    xcto: string;
    referrer: string;
  };
  issues: Array<{
    type: 'performance' | 'security' | 'accessibility' | 'seo';
    description: string;
    severity: 'high' | 'medium' | 'low';
    recommendation?: string;
  }>;
  tlsVersion: string;
  cdn: boolean;
  gzip: boolean;
}

/**
 * Main TechTab component – renders technical analysis panels with real data.
 */
const TechTab: React.FC<TechTabProps> = ({ data, loading, error }) => {
  const theme = useTheme();
  
  // State for comprehensive technical analysis
  const [techAnalysis, setTechAnalysis] = useState<TechnicalAnalysis | null>(null);
  const [techLoading, setTechLoading] = useState(false);
  const [techError, setTechError] = useState<string | null>(null);

  // Fetch comprehensive technical data when URL is available
  useEffect(() => {
    if (data?.url && !loading && !error) {
      fetchTechnicalAnalysis(data.url);
    }
  }, [data?.url, loading, error]);

  const fetchTechnicalAnalysis = async (url: string) => {
    setTechLoading(true);
    setTechError(null);
    
    try {
      console.log('🔧 Fetching comprehensive tech analysis for:', url);
      
      const response = await fetch('/api/tech', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url }),
      });

      if (!response.ok) {
        // Try to get fallback data from the main analysis
        console.warn('Enhanced tech analysis failed, using basic data if available');
        const fallbackData = data?.data?.technical;
        if (fallbackData && 'techStack' in fallbackData) {
          setTechAnalysis({
            ...fallbackData,
            adTags: fallbackData.adTags || [],
            securityHeaders: fallbackData.securityHeaders || { csp: 'Not Set', hsts: 'Not Set', xfo: 'Not Set', xss: 'Not Set', xcto: 'Not Set', referrer: 'Not Set' },
            tlsVersion: fallbackData.tlsVersion || 'Unknown',
            cdn: fallbackData.cdn || false,
            gzip: fallbackData.gzip || false
          });
          return;
        }
        throw new Error('Technical analysis temporarily unavailable');
      }

      const analysisData = await response.json();
      console.log('✅ Technical analysis data received:', analysisData);
      setTechAnalysis(analysisData);
    } catch (err) {
      console.error('Technical analysis error:', err);
      // Use fallback data from main analysis if available
      const fallbackData = data?.data?.technical;
      if (fallbackData && 'techStack' in fallbackData) {
        console.log('Using fallback technical data from main analysis');
        setTechAnalysis({
          ...fallbackData,
          adTags: fallbackData.adTags || [],
          securityHeaders: fallbackData.securityHeaders || { csp: 'Not Set', hsts: 'Not Set', xfo: 'Not Set', xss: 'Not Set', xcto: 'Not Set', referrer: 'Not Set' },
          tlsVersion: fallbackData.tlsVersion || 'Unknown',
          cdn: fallbackData.cdn || false,
          gzip: fallbackData.gzip || false
        });
      } else {
        setTechError('Technical analysis temporarily unavailable');
      }
    } finally {
      setTechLoading(false);
    }
  };

  // Loading: show spinner and message
  if (loading || techLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', py: 8 }}>
        <CircularProgress size={60} />
        <Typography variant="h6" sx={{ ml: 2 }}>
          {loading ? 'Analyzing tech stack...' : 'Extracting comprehensive technology data...'}
        </Typography>
      </Box>
    );
  }

  // Error state: show error alert
  if (error || techError) {
    return (
      <Alert severity="error" sx={{ mt: 2 }}>
        {error || techError}
      </Alert>
    );
  }

  // No data: prompt for input
  if (!data) {
    return (
      <Alert severity="info" sx={{ mt: 2 }}>
        Enter a URL to analyze website technology
      </Alert>
    );
  }

  // Use comprehensive technical analysis data if available, fallback to basic data
  const displayTechStack = techAnalysis?.techStack || data.data.technical?.techStack || [];
  const displayMinification = techAnalysis?.minification || data.data.technical?.minification;
  const displaySocial = techAnalysis?.social || data.data.technical?.social;
  const displayCookies = techAnalysis?.cookies || data.data.technical?.cookies;
  const displayAdTags = techAnalysis?.adTags || data.data.adTags;

  console.log('TechTab - using real tech analysis:', !!techAnalysis);
  console.log('TechTab - display data:', { displayAdTags, displaySocial, displayMinification });

  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
        <Typography variant="h5" gutterBottom sx={{ fontWeight: 'bold', flexGrow: 1 }}>
          Technical Analysis
        </Typography>
      </Box>
      <Box sx={{ display: 'grid', gap: 2, alignItems: 'stretch' }}>
        {/* Section: Tech Stack and Minification Status side by side */}
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '2fr 1fr' }, gap: 2 }}>
          <Card sx={{ borderRadius: 2 }}>
            <CardContent sx={{ p: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Layers size={24} color="#FF6B35" style={{ marginRight: 8 }} />
                <Typography 
                  variant="h6" 
                  sx={{ 
                    fontWeight: 'bold',
                    fontSize: { xs: '1.1rem', sm: '1.25rem' }
                  }}
                >
                  Tech Stack
                </Typography>

              </Box>
              <TechStackGrid techStack={displayTechStack} />
            </CardContent>
          </Card>

          <Card sx={{ borderRadius: 2 }}>
            <CardContent sx={{ p: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Settings size={24} color="#FF6B35" style={{ marginRight: 8 }} />
                <Typography 
                  variant="h6" 
                  sx={{ 
                    fontWeight: 'bold',
                    fontSize: { xs: '1.1rem', sm: '1.25rem' }
                  }}
                >
                  Minification Status
                </Typography>
              </Box>
              <Box sx={{ display: 'grid', gridTemplateColumns: '1fr', gap: 2 }}>
                <Tooltip
                  title={displayMinification?.cssMinified ? 'CSS files are minified for better performance' : 'CSS files are not minified - consider minifying for better performance'}
                  enterDelay={300}
                  enterTouchDelay={300}
                >
                  <Chip
                    label={`CSS: ${displayMinification?.cssMinified ? 'Minified' : 'Not Minified'}`}
                    {...chipStateStyle(Boolean(displayMinification?.cssMinified), theme)}
                    size="small"
                    sx={{ 
                      ...chipStateStyle(Boolean(displayMinification?.cssMinified), theme).sx, 
                      width: '100%',
                      cursor: 'help'
                    }}
                  />
                </Tooltip>
                <Tooltip
                  title={displayMinification?.jsMinified ? 'JavaScript files are minified for better performance' : 'JavaScript files are not minified - consider minifying for better performance'}
                  enterDelay={300}
                  enterTouchDelay={300}
                >
                  <Chip
                    label={`JavaScript: ${displayMinification?.jsMinified ? 'Minified' : 'Not Minified'}`}
                    {...chipStateStyle(Boolean(displayMinification?.jsMinified), theme)}
                    size="small"
                    sx={{ 
                      ...chipStateStyle(Boolean(displayMinification?.jsMinified), theme).sx, 
                      width: '100%',
                      cursor: 'help'
                    }}
                  />
                </Tooltip>
              </Box>
            </CardContent>
          </Card>
        </Box>

        {/* Section: Detected Ad Tags - Always show, don't use conditional */}
        <Card sx={{ borderRadius: 2 }}>
          <CardContent sx={{ p: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <Zap size={24} color="#FF6B35" style={{ marginRight: 8 }} />
            <Typography 
              variant="h6" 
              sx={{ 
                fontWeight: 'bold',
                fontSize: { xs: '1.1rem', sm: '1.25rem' }
              }}
            >
              Detected Ad Tags
            </Typography>
          </Box>
          <Box sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(3, 1fr)' },
            gap: 2
          }}>
            {adTagDescriptors.map(({ label, key }) => {
              const isDetected = Boolean(displayAdTags?.[key]);
              return (
                <Tooltip
                  key={key}
                  title={isDetected ? `${label} detected on this website` : `${label} not found on this website`}
                  enterDelay={300}
                  enterTouchDelay={300}
                >
                  <Chip
                    label={label}
                    {...chipStateStyle(isDetected, theme)}
                    size="small"
                    sx={{
                      ...chipStateStyle(isDetected, theme).sx,
                      justifyContent: 'center',
                      textAlign: 'center',
                      cursor: 'help',
                      '& .MuiChip-label': {
                        width: '100%',
                        textAlign: 'center'
                      }
                    }}
                  />
                </Tooltip>
              );
            })}
          </Box>
        </CardContent>
      </Card>

        {/* Section: Detected Social Tags */}
        <Card sx={{ borderRadius: 2 }}>
          <CardContent sx={{ p: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <Users size={24} color="#FF6B35" style={{ marginRight: 8 }} />
            <Typography 
              variant="h6" 
              sx={{ 
                fontWeight: 'bold',
                fontSize: { xs: '1.1rem', sm: '1.25rem' }
              }}
            >
              Detected Social Tags
            </Typography>
          </Box>
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(3, 1fr)' }, gap: 2 }}>
            <Tooltip
              title={displaySocial?.hasOpenGraph ? 'Open Graph meta tags detected' : 'Open Graph meta tags not found'}
              enterDelay={300}
              enterTouchDelay={300}
            >
              <Chip
                label="Open Graph Meta Tags"
                {...chipStateStyle(Boolean(displaySocial?.hasOpenGraph), theme)}
                size="small"
                sx={{ 
                  ...chipStateStyle(Boolean(displaySocial?.hasOpenGraph), theme).sx, 
                  width: '100%',
                  cursor: 'help'
                }}
              />
            </Tooltip>
            <Tooltip
              title={displaySocial?.hasTwitterCard ? 'Twitter card meta tags detected' : 'Twitter card meta tags not found'}
              enterDelay={300}
              enterTouchDelay={300}
            >
              <Chip
                label="Twitter Card Meta Tags"
                {...chipStateStyle(Boolean(displaySocial?.hasTwitterCard), theme)}
                size="small"
                sx={{ 
                  ...chipStateStyle(Boolean(displaySocial?.hasTwitterCard), theme).sx, 
                  width: '100%',
                  cursor: 'help'
                }}
              />
            </Tooltip>
            <Tooltip
              title={displaySocial?.hasShareButtons ? 'Share buttons detected on the website' : 'Share buttons not found on the website'}
              enterDelay={300}
              enterTouchDelay={300}
            >
              <Chip
                label="Share Buttons"
                {...chipStateStyle(Boolean(displaySocial?.hasShareButtons), theme)}
                size="small"
                sx={{ 
                  ...chipStateStyle(Boolean(displaySocial?.hasShareButtons), theme).sx, 
                  width: '100%',
                  cursor: 'help'
                }}
              />
            </Tooltip>
          </Box>
          </CardContent>
        </Card>

        {/* Section: Cookie Banner & Consent Script */}
        <Card sx={{ borderRadius: 2 }}>
        <CardContent sx={{ p: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
            <Cookie size={24} color="#FF6B35" style={{ marginRight: 8 }} />
            <Typography 
              variant="h6" 
              sx={{ 
                fontWeight: 'bold',
                fontSize: { xs: '1.1rem', sm: '1.25rem' }
              }}
            >
              Detected Cookie Banner & Consent Script
            </Typography>
          </Box>
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(3, 1fr)' }, gap: 2 }}>
            {displayCookies?.hasCookieScript ? (
              <Tooltip
                title="Cookie consent script detected on this website"
                enterDelay={300}
                enterTouchDelay={300}
              >
                <Chip
                  label="Cookie Consent Script Detected"
                  {...chipStateStyle(true, theme)}
                  size="small"
                  sx={{ 
                    ...chipStateStyle(true, theme).sx,
                    width: '100%',
                    cursor: 'help'
                  }}
                />
              </Tooltip>
            ) : (
              <Tooltip
                title="No cookie consent script found on this website"
                enterDelay={300}
                enterTouchDelay={300}
              >
                <Chip
                  label="No Cookie Consent Script Found"
                  {...chipStateStyle(false, theme)}
                  size="small"
                  sx={{ 
                    ...chipStateStyle(false, theme).sx,
                    width: '100%',
                    cursor: 'help'
                  }}
                />
              </Tooltip>
            )}
          </Box>
        </CardContent>
      </Card>



        {/* Section: Technical Issues & Health */}
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '2fr 1fr' }, gap: 2 }}>
          <Card sx={{ borderRadius: 2 }}>
            <CardContent sx={{ p: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
              <Shield size={24} color="#FF6B35" style={{ marginRight: 8 }} />
              <Typography 
                variant="h6" 
                sx={{ 
                  fontWeight: 'bold',
                  fontSize: { xs: '1.1rem', sm: '1.25rem' }
                }}
              >
                Technical Issues
              </Typography>
            </Box>
            <div className="relative w-full overflow-auto">
              <table className="w-full caption-bottom text-sm">
                <thead className="[&_tr]:border-b">
                  <tr>
                    <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground [&:has([role=checkbox])]:pr-0">Type</th>
                    <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground [&:has([role=checkbox])]:pr-0">Description</th>
                    <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground [&:has([role=checkbox])]:pr-0">Severity</th>
                    <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground [&:has([role=checkbox])]:pr-0">Status</th>
                  </tr>
                </thead>
                <tbody className="[&_tr:last-child]:border-0">
                  {(techAnalysis?.issues ?? data?.data?.technical?.issues ?? []).map((issue, index) => (
                    <tr key={index} className="border-b transition-colors [&:has([role=checkbox])]:pr-0">
                      <td className="p-4 align-middle [&:has([role=checkbox])]:pr-0">{issue.type}</td>
                      <td className="p-4 align-middle [&:has([role=checkbox])]:pr-0">{issue.description}</td>
                      <td className="p-4 align-middle [&:has([role=checkbox])]:pr-0">
                        <Tooltip
                          title={`${issue.severity.charAt(0).toUpperCase() + issue.severity.slice(1)} severity issue - ${
                            issue.severity === 'high' ? 'requires immediate attention' :
                            issue.severity === 'medium' ? 'should be addressed soon' :
                            'low priority but worth fixing'
                          }`}
                          enterDelay={300}
                          enterTouchDelay={300}
                        >
                          <Chip
                            label={issue.severity}
                            {...chipSeverityStyle(issue.severity, theme)}
                            size="small"
                            sx={{
                              ...chipSeverityStyle(issue.severity, theme).sx,
                              cursor: 'help'
                            }}
                          />
                        </Tooltip>
                      </td>
                      <td className="p-4 align-middle [&:has([role=checkbox])]:pr-0">{issue.status}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
          </Card>
          <TechnicalHealthSummary 
            healthGrade={data?.data?.technical?.healthGrade ?? 'C'} 
            issues={techAnalysis?.issues ?? data?.data?.technical?.issues ?? []} 
          />
        </Box>
      </Box>
    </Box>
  );
};

export default TechTab;

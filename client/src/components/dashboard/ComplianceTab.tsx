import React, { useState, useMemo } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Alert,
  Chip,
  useTheme,
  Tooltip,
  Collapse,
  IconButton,
  Badge,
} from '@mui/material';
import { ChevronDown, ChevronUp, Shield, Accessibility, CheckCircle, Lock } from 'lucide-react';
import type { AnalysisResponse } from '@/types/analysis';
import { dashIfEmpty } from '../../lib/ui';
import { useAnalysisContext } from '../../contexts/AnalysisContext';

interface ComplianceTabProps {
  data: AnalysisResponse | null;
  loading: boolean;
  error: string | null;
}

function chipStateStyle(isActive: boolean, theme: any) {
  return isActive
    ? {
        variant: 'outlined' as const,
        sx: {
          borderColor: theme.palette.success.main,
          color: theme.palette.success.main,
          background: 'transparent',
          fontWeight: 600,
        },
      }
    : {
        variant: 'outlined' as const,
        color: 'default' as const,
        sx: {
          borderColor: theme.palette.grey[400],
          color: theme.palette.grey[400],
          background: 'transparent',
          fontWeight: 600,
        },
      };
}

const ComplianceTab: React.FC<ComplianceTabProps> = ({ data, loading, error }) => {
  const theme = useTheme();
  const [securityGradeExpanded, setSecurityGradeExpanded] = useState(false);
  const [headerSectionsExpanded, setHeaderSectionsExpanded] = useState<Record<string, boolean>>({});
  const [glowingSections, setGlowingSections] = React.useState<Record<string, boolean>>({});
  const { data: contextData } = useAnalysisContext();

  const toggleHeaderSection = (sectionName: string) => {
    setHeaderSectionsExpanded(prev => ({
      ...prev,
      [sectionName]: !prev[sectionName]
    }));
  };
  
  // Remove tab-level loading - we use section-level loading instead

  if (error) {
    return (
      <Alert severity="error" sx={{ mt: 2 }}>
        {error}
      </Alert>
    );
  }

  if (!data) {
    return (
      <Alert severity="info" sx={{ mt: 2 }}>
        Enter a URL to analyze site compliance
      </Alert>
    );
  }

  // Use original data structure that was working before
  const tech = data?.data?.tech || data?.data?.technical || { accessibility: { violations: [] } };
  const violations = tech.accessibility?.violations || [];
  const social = tech.social || { hasOpenGraph: false, hasTwitterCard: false, hasShareButtons: false };
  const cookies = tech.cookies || { hasCookieScript: false, scripts: [] };
  const minify = tech.minification || { cssMinified: false, jsMinified: false };
  const lighthouseSecurityScore = tech.lighthouseScore || 0;
  const lhr = tech.lighthouse || null;
  const links = tech.linkIssues || { brokenLinks: [], mixedContentLinks: [] };

  // Get security headers from the tech data (new structure)
  const securityHeaders = tech.securityHeaders || data?.securityHeaders || { 
    csp: '', 
    hsts: '', 
    xfo: '', 
    xcto: '', 
    referrer: '' 
  };
  
  // Simplified security score logic to avoid dependency issues
  const showSeparateSecurityGrade = false; // Disable separate security grade for now

  // Memoize header categories to prevent infinite loops in useEffect
  const headerCategories = useMemo(() => [
    {
      name: 'Content Security Policy',
      headers: [
        { name: 'Content-Security-Policy', value: securityHeaders.csp, description: 'Prevents XSS and code injection attacks' },
        { name: 'Content-Security-Policy-Report-Only', value: '', description: 'Reports CSP violations without blocking' }
      ]
    },
    {
      name: 'Transport Security',
      headers: [
        { name: 'Strict-Transport-Security', value: securityHeaders.hsts, description: 'Enforces HTTPS connections' },
        { name: 'Upgrade-Insecure-Requests', value: '', description: 'Upgrades HTTP requests to HTTPS' }
      ]
    },
    {
      name: 'Frame Protection',
      headers: [
        { name: 'X-Frame-Options', value: securityHeaders.xfo, description: 'Prevents clickjacking attacks' },
        { name: 'X-Content-Type-Options', value: securityHeaders.xcto, description: 'Prevents MIME type sniffing' }
      ]
    },
    {
      name: 'Referrer Policy',
      headers: [
        { name: 'Referrer-Policy', value: securityHeaders.referrer, description: 'Controls referrer information' }
      ]
    }
  ], [securityHeaders.csp, securityHeaders.hsts, securityHeaders.xfo, securityHeaders.xcto, securityHeaders.referrer]);

  // Restored auto-collapse animation with fixed dependencies
  React.useEffect(() => {
    if (!data || headerCategories.length === 0) return;
    
    // Always initialize sections as expanded for fresh data
    const initialState: Record<string, boolean> = {};
    headerCategories.forEach(category => {
      initialState[category.name] = true;
    });
    setHeaderSectionsExpanded(initialState);

    // Start glow animation 1 second before collapse
    const glowTimer = setTimeout(() => {
      const glowState: Record<string, boolean> = {};
      headerCategories.forEach(category => {
        glowState[category.name] = true;
      });
      setGlowingSections(glowState);
    }, 1500); // Start glowing at 1.5s (collapse happens at 2.5s)

    // Auto-collapse all sections after delay
    const collapseTimer = setTimeout(() => {
      const collapsedState: Record<string, boolean> = {};
      headerCategories.forEach(category => {
        collapsedState[category.name] = false;
      });
      setHeaderSectionsExpanded(collapsedState);
      // Stop glowing after collapse
      setGlowingSections({});
    }, 2500);

    return () => {
      clearTimeout(glowTimer);
      clearTimeout(collapseTimer);
    };
  }, [data?.url, headerCategories]); // Fixed dependencies - now memoized

  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
        <Typography variant="h5" gutterBottom sx={{ fontWeight: 'bold', flexGrow: 1 }}>
          Compliance Audits
        </Typography>
      </Box>
      
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: showSeparateSecurityGrade ? '1fr 1fr 1fr' : '1fr 1fr' }, gap: 2, mb: 2 }}>
        {/* Security Headers - No top-level collapsibility */}
        <Card sx={{ borderRadius: 2 }}>
          <CardContent sx={{ p: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <Lock size={24} style={{ marginRight: 8, color: theme.palette.primary.main }} />
              <Typography 
                variant="h6" 
                sx={{ 
                  fontWeight: 'bold',
                  fontSize: { xs: '1.1rem', sm: '1.25rem' }
                }}
              >
                Security Headers
              </Typography>
            </Box>
            
            <Box>
              {headerCategories.map((category, categoryIndex) => (
                <Box key={categoryIndex} sx={{ mb: 2 }}>
                  {/* Category Header with glow animation */}
                  <Box
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      cursor: 'pointer',
                      p: 1,
                      borderRadius: 1,
                      bgcolor: `${theme.palette.primary.main}0D`,
                      animation: glowingSections[category.name] ? 'pulse 1s ease-in-out infinite' : 'none',
                      '@keyframes pulse': {
                        '0%, 100%': {
                          boxShadow: `0 0 5px ${theme.palette.primary.main}4D`,
                        },
                        '50%': {
                          boxShadow: `0 0 15px ${theme.palette.primary.main}99`,
                        },
                      },
                      '&:hover': {
                        bgcolor: `${theme.palette.primary.main}1A`,
                      },
                    }}
                    onClick={() => toggleHeaderSection(category.name)}
                  >
                    <Typography variant="subtitle2" sx={{ color: theme.palette.primary.main }}>
                      {category.name} ({category.headers.filter(h => h.value).length}/{category.headers.length})
                    </Typography>
                    <IconButton size="small">
                      {headerSectionsExpanded[category.name] ? 
                        <ChevronUp size={16} /> : 
                        <ChevronDown size={16} />
                      }
                    </IconButton>
                  </Box>

                  {/* Collapsible Content with actual header values */}
                  <Collapse in={headerSectionsExpanded[category.name]}>
                    <Box sx={{ mt: 1, ml: 2 }}>
                      {category.headers.map((header, headerIndex) => (
                        <Box key={headerIndex} sx={{ mb: 2 }}>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                            <Box sx={{ flex: 1 }}>
                              <Typography variant="body2" sx={{ fontWeight: 'medium' }}>
                                {header.name}
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                {header.description}
                              </Typography>
                            </Box>
                            <Chip
                              label={header.value ? 'Present' : 'Missing'}
                              size="small"
                              {...chipStateStyle(Boolean(header.value), theme)}
                              sx={{ ml: 1, ...chipStateStyle(Boolean(header.value), theme).sx }}
                            />
                          </Box>
                          {/* Show actual header value if present */}
                          {header.value && (
                            <Box sx={{ 
                              mt: 1, 
                              p: 1, 
                              bgcolor: 'rgba(0, 0, 0, 0.05)', 
                              borderRadius: 1,
                              border: '1px solid rgba(0, 0, 0, 0.1)'
                            }}>
                              <Typography 
                                variant="caption" 
                                sx={{ 
                                  fontFamily: 'monospace',
                                  wordBreak: 'break-all',
                                  fontSize: '0.75rem',
                                  lineHeight: 1.4
                                }}
                              >
                                {header.value}
                              </Typography>
                            </Box>
                          )}
                        </Box>
                      ))}
                    </Box>
                  </Collapse>
                </Box>
              ))}
            </Box>
            )}
          </CardContent>
        </Card>

        {/* Security Grade - only show if different from Performance tab */}
        {showSeparateSecurityGrade && (
          <Card sx={{ borderRadius: 2 }}>
            <CardContent sx={{ p: 2 }}>
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  cursor: 'pointer',
                }}
                onClick={() => setSecurityGradeExpanded(!securityGradeExpanded)}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Shield size={24} color="#FF6B35" style={{ marginRight: 8 }} />
                  <Typography 
                    variant="h6" 
                    sx={{ 
                      fontWeight: 'bold',
                      fontSize: { xs: '1.1rem', sm: '1.25rem' }
                    }}
                  >
                    Security Grade
                  </Typography>
                  <Chip
                    label={`${lighthouseSecurityScore}%`}
                    size="small"
                    sx={{
                      backgroundColor: lighthouseSecurityScore >= 80 ? '#4CAF50' : lighthouseSecurityScore >= 60 ? '#FF9800' : '#F44336',
                      color: 'white',
                      fontWeight: 600,
                    }}
                  />
                </Box>
                <IconButton size="small">
                  {securityGradeExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                </IconButton>
              </Box>
              
              <Collapse in={securityGradeExpanded} timeout="auto">
                <Box sx={{ mt: 2 }}>
                  {lhr?.categories['best-practices'] ? (
                    <Box sx={{ display: 'grid', gap: 1 }}>
                      <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mb: 1 }}>
                        Lighthouse Security Checks
                      </Typography>
                      {lhr.categories['best-practices'].auditRefs
                        .filter(ref => ref.id.match(/-headers?/))
                        .map(ref => {
                          const audit = lhr.audits[ref.id];
                          const isPassing = audit.score === 1;
                          return (
                            <Box key={ref.id} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', py: 0.5 }}>
                              <Typography variant="body2" sx={{ fontWeight: 'medium' }}>
                                {audit.title}
                              </Typography>
                              <Typography variant="body2" sx={{ color: isPassing ? 'success.main' : 'error.main' }}>
                                {isPassing ? '✅ Pass' : '❌ Fail'}
                              </Typography>
                            </Box>
                          );
                        })
                      }
                    </Box>
                  ) : (
                    <Typography variant="body2" color="text.secondary">
                      Lighthouse security audit data not available
                    </Typography>
                  )}
                </Box>
              </Collapse>
            </CardContent>
          </Card>
        )}

        {/* Accessibility Violations */}
        <Card sx={{ borderRadius: 2 }}>
          <CardContent sx={{ p: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
              <Accessibility size={24} color="#FF6B35" style={{ marginRight: 8 }} />
              <Typography 
                variant="h6" 
                sx={{ 
                  fontWeight: 'bold',
                  fontSize: { xs: '1.1rem', sm: '1.25rem' }
                }}
              >
                Accessibility Violations
              </Typography>
            </Box>
            {violations.length === 0 ? (
              <Typography variant="body2">None</Typography>
            ) : (
              <Box component="ul" sx={{ pl: 2 }}>
                {violations.map((v, i) => (
                  <Typography component="li" variant="body2" key={i}>
                    {v.id} {v.description ? `- ${v.description}` : ''}
                  </Typography>
                ))}
              </Box>
            )}
          </CardContent>
        </Card>
      </Box>

      {/* Other Checks - using CheckCircle icon for compliance checks */}
      <Card sx={{ borderRadius: 2 }}>
        <CardContent sx={{ p: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
            <CheckCircle size={24} color="#FF6B35" style={{ marginRight: 8 }} />
            <Typography 
              variant="h6" 
              sx={{ 
                fontWeight: 'bold',
                fontSize: { xs: '1.1rem', sm: '1.25rem' }
              }}
            >
              Other Checks
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
            <Tooltip
              title={social.hasOpenGraph ? 'Open Graph tags detected' : 'Open Graph tags missing'}
              enterDelay={300}
              enterTouchDelay={300}
            >
              <Chip
                label="Open Graph"
                {...chipStateStyle(Boolean(social.hasOpenGraph), theme)}
                size="small"
                sx={{ cursor: 'help', ...chipStateStyle(Boolean(social.hasOpenGraph), theme).sx }}
              />
            </Tooltip>
            <Tooltip
              title={social.hasTwitterCard ? 'Twitter card tags detected' : 'Twitter card tags missing'}
              enterDelay={300}
              enterTouchDelay={300}
            >
              <Chip
                label="Twitter Card"
                {...chipStateStyle(Boolean(social.hasTwitterCard), theme)}
                size="small"
                sx={{ cursor: 'help', ...chipStateStyle(Boolean(social.hasTwitterCard), theme).sx }}
              />
            </Tooltip>
            <Tooltip
              title={social.hasShareButtons ? 'Share buttons found' : 'Share buttons not found'}
              enterDelay={300}
              enterTouchDelay={300}
            >
              <Chip
                label="Share Buttons"
                {...chipStateStyle(Boolean(social.hasShareButtons), theme)}
                size="small"
                sx={{ cursor: 'help', ...chipStateStyle(Boolean(social.hasShareButtons), theme).sx }}
              />
            </Tooltip>
            <Tooltip
              title={cookies.hasCookieScript ? 'Cookie consent script detected' : 'No cookie script found'}
              enterDelay={300}
              enterTouchDelay={300}
            >
              <Chip
                label="Cookie Script"
                {...chipStateStyle(Boolean(cookies.hasCookieScript), theme)}
                size="small"
                sx={{ cursor: 'help', ...chipStateStyle(Boolean(cookies.hasCookieScript), theme).sx }}
              />
            </Tooltip>
            <Tooltip
              title={minify.cssMinified ? 'CSS files are minified' : 'CSS files are not minified'}
              enterDelay={300}
              enterTouchDelay={300}
            >
              <Chip
                label="CSS Minified"
                {...chipStateStyle(Boolean(minify.cssMinified), theme)}
                size="small"
                sx={{ cursor: 'help', ...chipStateStyle(Boolean(minify.cssMinified), theme).sx }}
              />
            </Tooltip>
            <Tooltip
              title={minify.jsMinified ? 'JavaScript files are minified' : 'JavaScript files are not minified'}
              enterDelay={300}
              enterTouchDelay={300}
            >
              <Chip
                label="JS Minified"
                {...chipStateStyle(Boolean(minify.jsMinified), theme)}
                size="small"
                sx={{ cursor: 'help', ...chipStateStyle(Boolean(minify.jsMinified), theme).sx }}
              />
            </Tooltip>
          </Box>
          )}
          <Typography variant="body2">
            <strong>Broken Links:</strong> {links.brokenLinks.length || 0}
          </Typography>
          <Typography variant="body2">
            <strong>Mixed Content Links:</strong> {links.mixedContentLinks.length || 0}
          </Typography>
        </CardContent>
      </Card>
    </Box>
  );
};

export default ComplianceTab;

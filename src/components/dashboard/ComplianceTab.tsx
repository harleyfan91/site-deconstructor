
import React from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Alert,
  CircularProgress,
  Chip,
  Collapse,
  IconButton,
  useTheme,
  useMediaQuery,
  Tooltip,
} from '@mui/material';
import { ChevronDown, ChevronUp } from 'lucide-react';  
import type { AnalysisResponse } from '@/types/analysis';
import { dashIfEmpty } from '../../lib/ui';
import LegendContainer from './LegendContainer';

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
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  
  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', py: 8 }}>
        <CircularProgress size={60} />
        <Typography variant="h6" sx={{ ml: 2 }}>Analyzing compliance...</Typography>
      </Box>
    );
  }

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

  const { securityHeaders } = data;
  const [showAll, setShowAll] = React.useState(false);
  const tech = data.data.technical;
  const violations = tech.accessibility.violations;
  const social = tech.social || { hasOpenGraph: false, hasTwitterCard: false, hasShareButtons: false };
  const cookies = tech.cookies || { hasCookieScript: false, scripts: [] };
  const minify = tech.minification || { cssMinified: false, jsMinified: false };
  const links = tech.linkIssues || { brokenLinks: [], mixedContentLinks: [] };

  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
        <Typography variant="h5" gutterBottom sx={{ fontWeight: 'bold', flexGrow: 1 }}>
          Compliance Audits
        </Typography>
      </Box>
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 3 }}>
        <Card sx={{ borderRadius: 2 }}>
          <CardContent sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
              Security Headers
            </Typography>
            {(() => {
              const allEntries = Object.entries(securityHeaders);
              const visibleCount = isMobile ? 5 : 10;
              const baseEntries = allEntries.slice(0, visibleCount);
              const extraEntries = allEntries.slice(visibleCount);
              return (
                <>
                  <Box component="ul" sx={{ pl: 2 }}>
                    {baseEntries.map(([k, v]) => (
                      <Typography component="li" variant="body2" key={k}>
                        <strong>{k.toUpperCase()}:</strong> {dashIfEmpty(v)}
                      </Typography>
                    ))}
                  </Box>
                  {extraEntries.length > 0 && (
                    <Box sx={{ mt: 1 }}>
                      <Box
                        sx={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          cursor: 'pointer',
                          p: 1,
                          borderRadius: 1,
                          bgcolor: 'rgba(255, 107, 53, 0.05)',
                          '&:hover': {
                            bgcolor: 'rgba(255, 107, 53, 0.1)',
                          },
                        }}
                        onClick={() => setShowAll((prev) => !prev)}
                      >
                        <Typography
                          variant="subtitle1"
                          sx={{ fontWeight: 'bold', color: '#FF6B35' }}
                        >
                          All
                        </Typography>
                        <IconButton size="small">
                          {showAll ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                        </IconButton>
                      </Box>
                      <Collapse in={showAll}>
                        <Box component="ul" sx={{ pl: 2, mt: 1 }}>
                          {extraEntries.map(([k, v]) => (
                            <Typography component="li" variant="body2" key={k}>
                              <strong>{k.toUpperCase()}:</strong> {dashIfEmpty(v)}
                            </Typography>
                          ))}
                        </Box>
                      </Collapse>
                    </Box>
                  )}
                </>
              );
            })()}
          </CardContent>
        </Card>

        <Card sx={{ borderRadius: 2 }}>
          <CardContent sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
              Accessibility Violations
            </Typography>
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

        <Box sx={{ gridColumn: { xs: '1', md: '1 / -1' } }}>
          <Card sx={{ borderRadius: 2 }}>
            <CardContent sx={{ p: 2 }}>
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
                Other Checks
              </Typography>
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
              <Typography variant="body2">
                <strong>Broken Links:</strong> {links.brokenLinks.length || 0}
              </Typography>
              <Typography variant="body2">
                <strong>Mixed Content Links:</strong> {links.mixedContentLinks.length || 0}
              </Typography>
            </CardContent>
          </Card>
        </Box>
      </Box>
    </Box>
  );
};

export default ComplianceTab;

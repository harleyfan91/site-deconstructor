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

const ComplianceTab: React.FC<ComplianceTabProps> = ({ data, loading, error }) => {
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
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
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
                <Chip label={`Open Graph: ${social.hasOpenGraph ? 'yes' : dashIfEmpty('')}` } />
                <Chip label={`Twitter Card: ${social.hasTwitterCard ? 'yes' : dashIfEmpty('')}` } />
                <Chip label={`Share Buttons: ${social.hasShareButtons ? 'yes' : dashIfEmpty('')}` } />
                <Chip label={`Cookie Script: ${cookies.hasCookieScript ? 'yes' : dashIfEmpty('')}` } />
                <Chip label={`CSS Minified: ${minify.cssMinified ? 'yes' : dashIfEmpty('')}` } />
                <Chip label={`JS Minified: ${minify.jsMinified ? 'yes' : dashIfEmpty('')}` } />
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

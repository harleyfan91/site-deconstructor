
import React from 'react';
import { Box, Typography, Card, CardContent, Alert, CircularProgress, Chip, Grid } from '@mui/material';
import type { AnalysisResponse } from '@/types/analysis';
import { dashIfEmpty } from '../../lib/ui';

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
  const tech = data.data.technical;
  const violations = tech.accessibility.violations;
  const social = tech.social || { hasOpenGraph: false, hasTwitterCard: false, hasShareButtons: false };
  const cookies = tech.cookies || { hasCookieScript: false, scripts: [] };
  const minify = tech.minification || { cssMinified: false, jsMinified: false };
  const links = tech.linkIssues || { brokenLinks: [], mixedContentLinks: [] };

  return (
    <Box>
      <Typography variant="h5" gutterBottom sx={{ fontWeight: 'bold', mb: 3 }}>
        Compliance Audits
      </Typography>

      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Card sx={{ borderRadius: 2 }}>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
                Security Headers
              </Typography>
              <Box component="ul" sx={{ pl: 2 }}>
                {Object.entries(securityHeaders).map(([k, v]) => (
                  <Typography component="li" variant="body2" key={k}>
                    <strong>{k.toUpperCase()}:</strong> {dashIfEmpty(v)}
                  </Typography>
                ))}
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card sx={{ borderRadius: 2 }}>
            <CardContent sx={{ p: 3 }}>
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
        </Grid>

        <Grid item xs={12}>
          <Card sx={{ borderRadius: 2 }}>
            <CardContent sx={{ p: 3 }}>
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
        </Grid>
      </Grid>
    </Box>
  );
};

export default ComplianceTab;

// MUI imports
import React from 'react';
import { Box, Typography, Card, CardContent, Chip, CircularProgress, Alert } from '@mui/material';

// Lucide icons
import { Shield, Globe, Server, Database, Code, Layers, Zap, Activity, BarChart } from 'lucide-react';
// Table UI component
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';

// Types
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
    default: return theme.palette.neutral?.main || '#757575';
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
          borderColor: theme.palette.neutral?.main || "#BDBDBD",
          color: theme.palette.neutral?.main || "#BDBDBD",
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
        <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
          Technical Health
        </Typography>
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

/**
 * Main TechTab component – renders technical analysis panels.
 * UI & logic are unchanged.
 */
const TechTab: React.FC<TechTabProps> = ({ data, loading, error }) => {
  const theme = useTheme();

  // Loading: show spinner and message
  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', py: 8 }}>
        <CircularProgress size={60} />
        <Typography variant="h6" sx={{ ml: 2 }}>Analyzing tech stack...</Typography>
      </Box>
    );
  }

  // Error state: show error alert
  if (error) {
    return (
      <Alert severity="error" sx={{ mt: 2 }}>
        {error}
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

  // Main render
  const { technical } = data.data;

  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
        <Typography variant="h5" gutterBottom sx={{ fontWeight: 'bold', flexGrow: 1 }}>
          Technical Analysis
        </Typography>
        <LegendContainer />
      </Box>
      {/* Section: Tech Stack */}
      <Card sx={{ borderRadius: 2, mb: 3 }}>
        <CardContent sx={{ p: 3 }}>
          <Box sx={{ mb: 3 }}>
            <Typography variant="h6" sx={{ fontWeight: 'bold', display: 'inline' }}>
              Tech Stack
            </Typography>
            <Typography variant="body2" sx={{
              fontSize: '0.75rem',
              fontWeight: 'normal',
              color: 'text.secondary',
              ml: 1,
              display: 'inline'
            }}>
              (Powered by Wappalyzer)
            </Typography>
          </Box>
          <TechStackGrid techStack={technical.techStack ?? []} />
        </CardContent>
      </Card>

      {/* Section: Detected Ad Tags */}
      {data.data.adTags && (
        <Card sx={{ borderRadius: 2, mb: 3 }}>
          <CardContent sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold', mb: 3 }}>
              Detected Ad Tags
            </Typography>
            <Box sx={{
              display: 'grid',
              gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(3, 1fr)' },
              gap: 2
            }}>
              {adTagDescriptors.map(({ label, key }) => (
                <Chip
                  key={key}
                  label={label}
                  {...chipStateStyle(Boolean(data.data.adTags[key]), theme)}
                  size="small"
                  sx={{
                    ...chipStateStyle(Boolean(data.data.adTags[key]), theme).sx,
                    justifyContent: 'center',
                    textAlign: 'center',
                    '& .MuiChip-label': {
                      width: '100%',
                      textAlign: 'center'
                    }
                  }}
                />
              ))}
            </Box>
          </CardContent>
        </Card>
      )}

      {/* Section: Detected Social Tags */}
      <Card sx={{ borderRadius: 2, mb: 3 }}>
        <CardContent sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold', mb: 3 }}>
            Detected Social Tags
          </Typography>
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(3, 1fr)' }, gap: 2 }}>
            <Chip
              label="Open Graph Meta Tags"
              {...chipStateStyle(Boolean(technical.social?.hasOpenGraph), theme)}
              size="small"
              sx={{ ...chipStateStyle(Boolean(technical.social?.hasOpenGraph), theme).sx, width: '100%' }}
            />
            <Chip
              label="Twitter Card Meta Tags"
              {...chipStateStyle(Boolean(technical.social?.hasTwitterCard), theme)}
              size="small"
              sx={{ ...chipStateStyle(Boolean(technical.social?.hasTwitterCard), theme).sx, width: '100%' }}
            />
            <Chip
              label="Share Buttons"
              {...chipStateStyle(Boolean(technical.social?.hasShareButtons), theme)}
              size="small"
              sx={{ ...chipStateStyle(Boolean(technical.social?.hasShareButtons), theme).sx, width: '100%' }}
            />
          </Box>
        </CardContent>
      </Card>

      {/* Section: Cookie Banner & Consent Script */}
      <Card sx={{ borderRadius: 2, mb: 3 }}>
        <CardContent sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold', mb: 3 }}>
            Detected Cookie Banner & Consent Script
          </Typography>
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(3, 1fr)' }, gap: 2 }}>
            {technical.cookies?.hasCookieScript ? (
              <Chip
                label="Cookie Consent Script Detected"
                {...chipStateStyle(true, theme)}
                size="medium"
              />
            ) : (
              <Chip
                label="No Cookie Consent Script Found"
                {...chipStateStyle(false, theme)}
                size="medium"
              />
            )}
          </Box>
        </CardContent>
      </Card>

      {/* Section: Minification Status */}
      <Card sx={{ borderRadius: 2, mb: 3 }}>
        <CardContent sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold', mb: 3 }}>
            Minification Status
          </Typography>
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)' }, gap: 2 }}>
            <Chip
              label={`CSS: ${technical.minification?.cssMinified ? 'Minified' : 'Not Minified'}`}
              {...chipStateStyle(Boolean(technical.minification?.cssMinified), theme)}
              size="medium"
              sx={{ ...chipStateStyle(Boolean(technical.minification?.cssMinified), theme).sx, width: '100%' }}
            />
            <Chip
              label={`JavaScript: ${technical.minification?.jsMinified ? 'Minified' : 'Not Minified'}`}
              {...chipStateStyle(Boolean(technical.minification?.jsMinified), theme)}
              size="medium"
              sx={{ ...chipStateStyle(Boolean(technical.minification?.jsMinified), theme).sx, width: '100%' }}
            />
          </Box>
        </CardContent>
      </Card>

      {/* Section: Technical Issues & Health */}
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '2fr 1fr' }, gap: 3 }}>
        <Card sx={{ borderRadius: 2 }}>
          <CardContent sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
              Technical Issues
            </Typography>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Type</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Severity</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {(technical.issues ?? []).map((issue, index) => (
                  <TableRow key={index}>
                    <TableCell>{issue.type}</TableCell>
                    <TableCell>{issue.description}</TableCell>
                    <TableCell>
                      <Chip
                        label={issue.severity}
                        {...chipSeverityStyle(issue.severity, theme)}
                        size="small"
                        sx={{
                          ...chipSeverityStyle(issue.severity, theme).sx,
                          height: 22,
                          fontSize: '0.82rem'
                        }}
                      />
                    </TableCell>
                    <TableCell>{issue.status}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
        <TechnicalHealthSummary healthGrade={technical.healthGrade} issues={technical.issues ?? []} />
      </Box>
    </Box>
  );
};

export default TechTab;

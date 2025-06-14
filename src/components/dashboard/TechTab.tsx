
import React from 'react';
import { Box, Typography, Card, CardContent, Chip, CircularProgress, Alert } from '@mui/material';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { Shield, Globe, Server, Database, Code, Layers, Zap, Activity, BarChart } from 'lucide-react';
import type { AnalysisResponse } from '@/types/analysis';

// Helper: Maps category name to an icon component from Lucide
const iconMap: { [key: string]: React.ElementType } = {
  'Frontend Framework': Code,
  'JavaScript frameworks': Code,
  'Framework': Code,
  'Build Tool': Zap,
  'Styling': Layers,
  'CSS frameworks': Layers,
  'CSS Framework': Layers,
  'Backend': Server,
  'Database': Database,
  'Databases': Database,
  'Hosting': Globe,
  'Library': Code,
  'JavaScript libraries': Code,
  'Markup': Code,
  'Web servers': Server,
  'Analytics': BarChart,
  'Tag managers': Activity,
  'CDN': Globe,
  'Content delivery networks': Globe,
  'Widgets': Code,
  'Unknown': Code,
  'default': Server
};
// Returns the icon for a given category or a default if unknown
function getIcon(category: string): React.ElementType {
  return iconMap[category] || iconMap['default'];
}

// Returns color for severity level (e.g. high/medium/low)
function getSeverityColor(severity: string): string {
  switch (severity.toLowerCase()) {
    case 'high':
      return '#F44336';
    case 'medium':
      return '#FF9800';
    case 'low':
      return '#4CAF50';
    default:
      return '#757575';
  }
}

// Returns filled/outlined Chip props for severity
function chipSeverityStyle(severity: string) {
  const color = getSeverityColor(severity);
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

// Returns outlined Chip props for active/inactive states (used for tag/consent chips)
function chipStateStyle(isActive: boolean, color = "#4CAF50") {
  return isActive
    ? {
        variant: "outlined" as const,
        sx: {
          borderColor: color,
          color,
          background: "transparent",
          fontWeight: 600,
        }
      }
    : {
        variant: "outlined" as const,
        color: "default" as const,
        sx: {
          borderColor: "#BDBDBD",
          color: "#BDBDBD",
          background: "transparent",
          fontWeight: 600,
        }
      }
}

// Returns grade color (A/B/C/D/etc)
function getHealthGradeColor(grade: string): string {
  if (grade.startsWith('A')) return '#4CAF50';
  if (grade.startsWith('B')) return '#8BC34A';
  if (grade.startsWith('C')) return '#FF9800';
  return '#F44336';
}

// Sub-component: Tech Stack Cards
function TechStackGrid({ techStack }: { techStack: { category: string; technology: string }[] }) {
  return (
    <Box
      sx={{
        display: 'grid',
        gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(3, 1fr)' },
        gap: 2,
      }}
    >
      {techStack.map((tech, index) => {
        const IconComponent = getIcon(tech.category);
        return (
          <Box
            key={index}
            sx={{
              p: 0,
              border: '1px solid #E0E0E0',
              borderRadius: 2,
              display: 'flex',
              flexDirection: 'column',
              minHeight: 92,
              height: 120,
              overflow: 'hidden',
              boxShadow: '0 0 0 0 transparent',
              '&:hover': { boxShadow: '0 2px 12px rgba(255,107,53,0.09)' },
            }}
          >
            {/* Top 2/3: Orange background, icon, and bold orange category (no chip container) */}
            <Box
              sx={{
                flex: 2,
                minHeight: 0,
                px: 2,
                py: 1.5,
                display: 'flex',
                alignItems: 'center',
                backgroundColor: '#363330',
                borderTopLeftRadius: 14,
                borderTopRightRadius: 14,
                gap: 1.5,
              }}
            >
              <IconComponent size={22} color="#FF6B35" style={{ marginRight: 10, flexShrink: 0 }} />
              <Typography
                variant="subtitle2"
                sx={{
                  color: '#FF6B35',
                  fontWeight: 700,
                  fontSize: '1rem',
                  letterSpacing: 0.1,
                  textShadow: 'none',
                  lineHeight: 1.2,
                  userSelect: 'text',
                  pr: 0,
                }}
              >
                {tech.category}
              </Typography>
            </Box>
            {/* Bottom 1/3: transparent, white tech name */}
            <Box
              sx={{
                flex: 1,
                minHeight: 0,
                px: 2,
                py: 1.1,
                display: 'flex',
                alignItems: 'center',
                backgroundColor: 'transparent',
                borderBottomLeftRadius: 14,
                borderBottomRightRadius: 14,
              }}
            >
              <Typography
                variant="subtitle1"
                sx={{
                  color: '#FFF',
                  fontWeight: 700,
                  fontSize: '1rem',
                  letterSpacing: 0.1,
                  textAlign: 'left',
                  width: '100%',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                }}
              >
                {tech.technology}
              </Typography>
            </Box>
          </Box>
        );
      })}
    </Box>
  );
}

// Sub-component: Ad Tags grid (array of tag descriptors, kept outside main for clarity)
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

// Sub-component: Health Grade/Issue Summary
function TechnicalHealthSummary({ healthGrade, issues }: { healthGrade: string, issues: any[] }) {
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
              {(issues ?? []).filter(i => i.severity === 'high').length}
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
            <Typography variant="body2">Medium Severity</Typography>
            <Typography variant="body2" sx={{ fontWeight: 'bold', color: '#FF9800' }}>
              {(issues ?? []).filter(i => i.severity === 'medium').length}
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
            <Typography variant="body2">Low Severity</Typography>
            <Typography variant="body2" sx={{ fontWeight: 'bold', color: '#4CAF50' }}>
              {(issues ?? []).filter(i => i.severity === 'low').length}
            </Typography>
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
}

// The main component
interface TechTabProps {
  data: AnalysisResponse | null;
  loading: boolean;
  error: string | null;
}

const TechTab: React.FC<TechTabProps> = ({ data, loading, error }) => {
  // Loading state
  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', py: 8 }}>
        <CircularProgress size={60} />
        <Typography variant="h6" sx={{ ml: 2 }}>Analyzing tech stack...</Typography>
      </Box>
    );
  }

  // Error state
  if (error) {
    return (
      <Alert severity="error" sx={{ mt: 2 }}>
        {error}
      </Alert>
    );
  }

  // If no data, prompt for input
  if (!data) {
    return (
      <Alert severity="info" sx={{ mt: 2 }}>
        Enter a URL to analyze website technology
      </Alert>
    );
  }

  const { technical } = data.data;

  return (
    <Box>
      {/* Section: Technical Analysis */}
      <Typography variant="h5" gutterBottom sx={{ fontWeight: 'bold', mb: 3 }}>
        Technical Analysis
      </Typography>

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
                  {...chipStateStyle(Boolean(data.data.adTags[key]))}
                  size="small"
                  sx={{
                    ...chipStateStyle(Boolean(data.data.adTags[key])).sx,
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
              {...chipStateStyle(Boolean(technical.social?.hasOpenGraph))}
              size="small"
              sx={{ ...chipStateStyle(Boolean(technical.social?.hasOpenGraph)).sx, width: '100%' }}
            />
            <Chip
              label="Twitter Card Meta Tags"
              {...chipStateStyle(Boolean(technical.social?.hasTwitterCard))}
              size="small"
              sx={{ ...chipStateStyle(Boolean(technical.social?.hasTwitterCard)).sx, width: '100%' }}
            />
            <Chip
              label="Share Buttons"
              {...chipStateStyle(Boolean(technical.social?.hasShareButtons))}
              size="small"
              sx={{ ...chipStateStyle(Boolean(technical.social?.hasShareButtons)).sx, width: '100%' }}
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
                {...chipStateStyle(true)}
                size="medium"
              />
            ) : (
              <Chip
                label="No Cookie Consent Script Found"
                {...chipStateStyle(false)}
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
              {...chipStateStyle(Boolean(technical.minification?.cssMinified))}
              size="medium"
              sx={{ ...chipStateStyle(Boolean(technical.minification?.cssMinified)).sx, width: '100%' }}
            />
            <Chip
              label={`JavaScript: ${technical.minification?.jsMinified ? 'Minified' : 'Not Minified'}`}
              {...chipStateStyle(Boolean(technical.minification?.jsMinified))}
              size="medium"
              sx={{ ...chipStateStyle(Boolean(technical.minification?.jsMinified)).sx, width: '100%' }}
            />
          </Box>
        </CardContent>
      </Card>

      {/* Technical Issues & Technical Health */}
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
                        {...chipSeverityStyle(issue.severity)}
                        size="small"
                        sx={{
                          ...chipSeverityStyle(issue.severity).sx,
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


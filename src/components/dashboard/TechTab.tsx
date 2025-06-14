import React from 'react';
import { Box, Typography, Card, CardContent, Chip, CircularProgress, Alert } from '@mui/material';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { Shield, Globe, Server, Database, Code, Layers, Zap, Activity, BarChart } from 'lucide-react';
import type { AnalysisResponse } from '@/types/analysis';

interface TechTabProps {
  data: AnalysisResponse | null;
  loading: boolean;
  error: string | null;
}

const TechTab: React.FC<TechTabProps> = ({ data, loading, error }) => {
  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', py: 8 }}>
        <CircularProgress size={60} />
        <Typography variant="h6" sx={{ ml: 2 }}>Analyzing tech stack...</Typography>
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
        Enter a URL to analyze website technology
      </Alert>
    );
  }

  const { technical } = data.data;

  const iconMap: { [key: string]: any } = {
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

  const getIcon = (category: string) => {
    return iconMap[category] || iconMap['default'];
  };

  const getSeverityColor = (severity: string) => {
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
  };

  // Add a helper to standardize Chip props for severity/status
  const chipSeverityStyle = (severity: string) => ({
    variant: "outlined" as const,
    sx: {
      borderColor: getSeverityColor(severity),
      color: getSeverityColor(severity),
      background: "transparent", // ensure outlined & transparent
      fontWeight: 600,
    }
  });

  // For ad/social/minification/cookie, default/gray will use 'default', and 'success' (filled) becomes outlined green
  const chipStateStyle = (isActive: boolean, color = "#4CAF50") =>
    isActive
      ? {
          variant: "outlined" as const,
          sx: {
            borderColor: color,
            color: color,
            background: "transparent",
            fontWeight: 600,
          }
        }
      : {
          variant: "outlined" as const,
          color: "default" as const,
          sx: {
            borderColor: "#BDBDBD",
            color: "#BDBDBD", // updated from #757575 to lighter gray
            background: "transparent",
            fontWeight: 600,
          }
        };

  const getHealthGradeColor = (grade: string) => {
    if (grade.startsWith('A')) return '#4CAF50';
    if (grade.startsWith('B')) return '#8BC34A';
    if (grade.startsWith('C')) return '#FF9800';
    return '#F44336';
  };

  return (
    <Box>
      <Typography variant="h5" gutterBottom sx={{ fontWeight: 'bold', mb: 3 }}>
        Technical Analysis
      </Typography>

      {/* Tech Stack Section */}
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
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(3, 1fr)' },
              gap: 2,
            }}
          >
            {(technical.techStack ?? []).map((tech, index) => {
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
                    minHeight: 92, // at least visible split
                    height: 120,
                    // Responsive height for better mobile experience
                    overflow: 'hidden',
                    boxShadow: '0 0 0 0 transparent',
                    '&:hover': { boxShadow: '0 2px 12px rgba(255,107,53,0.09)' },
                  }}
                >
                  {/* Top 2/3 section: Orange background, icon + bold category */}
                  <Box
                    sx={{
                      flex: 2,
                      minHeight: 0, // allows flex
                      px: 2,
                      py: 1.5,
                      display: 'flex',
                      alignItems: 'center',
                      backgroundColor: '#363330', // Light orange-brown matching your image
                      // Optional: use "#FF6B35" with opacity for paler look:
                      // backgroundColor: 'rgba(255, 107, 53, 0.11)',
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
                  {/* Bottom 1/3 section: Transparent, technology name in bold white */}
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
        </CardContent>
      </Card>

      {/* Detected Ad Tags Section */}
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
              {[
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
              ].map(({ label, key }) => (
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

      {/* Detected Social Tags Section */}
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

      {/* Cookie Banner & Consent Script Section */}
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

      {/* Minification Status Section */}
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

        <Card sx={{ borderRadius: 2 }}>
          <CardContent sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
              Technical Health
            </Typography>
            <Box sx={{ mb: 3 }}>
              <Typography variant="h3" sx={{
                fontWeight: 'bold',
                color: getHealthGradeColor(technical.healthGrade),
                textAlign: 'center'
              }}>
                {technical.healthGrade}
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
                  {(technical.issues ?? []).filter(i => i.severity === 'high').length}
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography variant="body2">Medium Severity</Typography>
                <Typography variant="body2" sx={{ fontWeight: 'bold', color: '#FF9800' }}>
                  {(technical.issues ?? []).filter(i => i.severity === 'medium').length}
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography variant="body2">Low Severity</Typography>
                <Typography variant="body2" sx={{ fontWeight: 'bold', color: '#4CAF50' }}>
                  {(technical.issues ?? []).filter(i => i.severity === 'low').length}
                </Typography>
              </Box>
            </Box>
          </CardContent>
        </Card>
      </Box>
    </Box>
  );
};

export default TechTab;

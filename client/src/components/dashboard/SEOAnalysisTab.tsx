
import React, { useState, useEffect } from 'react';
import { Box, Typography, Card, CardContent, Chip, CircularProgress, Alert, Tooltip, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper } from '@mui/material';
import { CheckCircle, AlertCircle, XCircle, Search, Target, TrendingUp, Hash, FileText, Globe, Shield, Check, X } from 'lucide-react';
import type { AnalysisResponse } from '@/types/analysis';
import { useTheme } from '@mui/material/styles';

interface SEOAnalysisTabProps {
  data: AnalysisResponse | null;
  loading: boolean;
  error: string | null;
}

const SEOAnalysisTab: React.FC<SEOAnalysisTabProps> = ({ data, loading, error }) => {
  const theme = useTheme();
  const [seoData, setSeoData] = useState<any>(null);
  const [seoLoading, setSeoLoading] = useState(false);
  const [seoError, setSeoError] = useState<string | null>(null);

  // Extract URL from the data
  const url = (data as any)?.url;

  useEffect(() => {
    if (url && !seoData && !seoLoading) {
      fetchSEOData();
    }
  }, [url]);

  const fetchSEOData = async () => {
    if (!url) return;
    
    setSeoLoading(true);
    setSeoError(null);
    
    try {
      const response = await fetch('/api/seo', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url: decodeURIComponent(url) }),
      });
      
      if (!response.ok) {
        throw new Error('SEO analysis failed');
      }
      
      const result = await response.json();
      setSeoData(result);
    } catch (err) {
      setSeoError(err instanceof Error ? err.message : 'SEO analysis failed');
    } finally {
      setSeoLoading(false);
    }
  };

  // Show general error
  if (error) {
    return (
      <Alert severity="error" sx={{ mt: 2 }}>
        {error}
      </Alert>
    );
  }

  // Show message when no URL is available
  if (!data || !url) {
    return (
      <Alert severity="info" sx={{ mt: 2 }}>
        Enter a URL to analyze website SEO
      </Alert>
    );
  }

  const seo = seoData || {};

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'good':
        return <CheckCircle size={20} color={theme.palette.success.main} />;
      case 'warning':
        return <AlertCircle size={20} color={theme.palette.warning.main} />;
      case 'error':
        return <XCircle size={20} color={theme.palette.error.main} />;
      default:
        return <CheckCircle size={20} color={theme.palette.success.main} />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'good':
        return 'success';
      case 'warning':
        return 'warning';
      case 'error':
        return 'error';
      default:
        return 'success';
    }
  };

  const getStatusTooltip = (status: string) => {
    switch (status) {
      case 'good':
        return 'SEO check passed - no issues found';
      case 'warning':
        return 'SEO warning - improvement recommended';
      case 'error':
        return 'SEO error - immediate attention required';
      default:
        return 'SEO check status unknown';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return theme.palette.error.main;
      case 'medium':
        return theme.palette.warning.main;
      case 'low':
        return theme.palette.success.main;
      default:
        return theme.palette.grey[400];
    }
  };

  const getPriorityTooltip = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'High priority - significant SEO impact';
      case 'medium':
        return 'Medium priority - moderate SEO impact';
      case 'low':
        return 'Low priority - minor SEO impact';
      default:
        return 'Priority level unknown';
    }
  };

  const seoScore = seoData?.score || 0;
  const seoScoreColor =
    seoScore >= 80
      ? theme.palette.success.main
      : seoScore >= 60
      ? theme.palette.warning.main
      : theme.palette.error.main;
  const seoScoreDescription =
    seoScore >= 80 ? 'Excellent SEO'
    : seoScore >= 60 ? 'Good SEO'
    : 'Needs Improvement';

  const getSeoScoreTooltip = (score: number) => {
    if (score >= 80) return 'Excellent SEO optimization (80+)';
    if (score >= 60) return 'Good SEO with room for improvement (60-79)';
    return 'Poor SEO - needs significant improvement (<60)';
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
        <Typography variant="h5" gutterBottom sx={{ fontWeight: 'bold', flexGrow: 1 }}>
          SEO Analysis
        </Typography>
      </Box>
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '2fr 1fr' }, gap: 2, mb: 2 }}>
        <Card sx={{ borderRadius: 2 }}>
          <CardContent sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
              <Search size={24} color={theme.palette.primary.main} style={{ marginRight: 8 }} />
              <Typography 
                variant="h6" 
                sx={{ 
                  fontWeight: 'bold',
                  fontSize: { xs: '1.1rem', sm: '1.25rem' }
                }}
              >
                SEO Checklist
              </Typography>
            </Box>
            <Box>
              {seoLoading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', py: 3 }}>
                  <CircularProgress size={32} sx={{ mr: 2 }} />
                  <Typography variant="body2" color="text.secondary">
                    Analyzing SEO checklist...
                  </Typography>
                </Box>
              ) : seoError ? (
                <Typography variant="body2" color="error" sx={{ fontStyle: 'italic', textAlign: 'center', py: 3 }}>
                  SEO analysis is temporarily unavailable. {seoError}
                </Typography>
              ) : !seoData ? (
                <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic', textAlign: 'center', py: 3 }}>
                  SEO analysis will begin shortly...
                </Typography>
              ) : seoData?.checks?.map((check, index) => (
                <Box
                  key={index}
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    p: 2,
                    borderBottom: index < seoData.checks.length - 1 ? '1px solid #E0E0E0' : 'none',
                  }}
                >
                  <Tooltip 
                    title={getStatusTooltip(check.status)}
                    enterDelay={300}
                    enterTouchDelay={300}
                  >
                    <Box sx={{ mr: 2, cursor: 'help' }}>
                      {getStatusIcon(check.status)}
                    </Box>
                  </Tooltip>
                  <Box sx={{ flexGrow: 1 }}>
                    <Typography variant="subtitle1" sx={{ fontWeight: 'medium' }}>
                      {check.name}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {check.description}
                    </Typography>
                  </Box>
                  <Tooltip 
                    title={getStatusTooltip(check.status)}
                    enterDelay={300}
                    enterTouchDelay={300}
                  >
                    <Chip
                      label={check.status}
                      color={getStatusColor(check.status) as any}
                      variant="outlined"
                      size="small"
                      sx={{ cursor: 'help' }}
                    />
                  </Tooltip>
                </Box>
              ))}
            </Box>
          </CardContent>
        </Card>

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <Card sx={{ borderRadius: 2 }}>
            <CardContent sx={{ p: 3, textAlign: 'center' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 3, justifyContent: 'center' }}>
                <Target size={24} color={theme.palette.primary.main} style={{ marginRight: 8 }} />
                <Typography 
                  variant="h6" 
                  sx={{ 
                    fontWeight: 'bold',
                    fontSize: { xs: '1.1rem', sm: '1.25rem' }
                  }}
                >
                  SEO Score
                </Typography>
              </Box>
              {seoLoading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', py: 3 }}>
                  <CircularProgress size={32} sx={{ mr: 2 }} />
                  <Typography variant="body2" color="text.secondary">
                    Calculating score...
                  </Typography>
                </Box>
              ) : seoError ? (
                <Typography variant="body2" color="error" sx={{ fontStyle: 'italic', py: 3 }}>
                  Score unavailable
                </Typography>
              ) : !seoData ? (
                <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic', py: 3 }}>
                  Score pending...
                </Typography>
              ) : (
                <>
                  <Tooltip 
                    title={getSeoScoreTooltip(seoScore)}
                    enterDelay={300}
                    enterTouchDelay={300}
                  >
                    <Typography variant="h2" sx={{ 
                      fontWeight: 'bold', 
                      color: seoScoreColor,
                      mb: 1,
                      cursor: 'help'
                    }}>
                      {seoScore}
                    </Typography>
                  </Tooltip>
                  <Typography variant="body2" color="text.secondary">
                    {seoScoreDescription}
                  </Typography>
                </>
              )}
            </CardContent>
          </Card>

          <Card sx={{ borderRadius: 2 }}>
            <CardContent sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                <TrendingUp size={24} color={theme.palette.primary.main} style={{ marginRight: 8 }} />
                <Typography 
                  variant="h6" 
                  sx={{ 
                    fontWeight: 'bold',
                    fontSize: { xs: '1.1rem', sm: '1.25rem' }
                  }}
                >
                  Analysis Status
                </Typography>
              </Box>
              {seoLoading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', py: 3 }}>
                  <CircularProgress size={32} sx={{ mr: 2 }} />
                  <Typography variant="body2" color="text.secondary">
                    Analyzing status...
                  </Typography>
                </Box>
              ) : seoError ? (
                <Typography variant="body2" color="error" sx={{ fontStyle: 'italic', textAlign: 'center', py: 3 }}>
                  Status unavailable
                </Typography>
              ) : !seoData ? (
                <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic', textAlign: 'center', py: 3 }}>
                  Status pending...
                </Typography>
              ) : (
                <Box sx={{ mb: 2 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="body2">Checks Passed</Typography>
                    <Tooltip 
                      title="Number of SEO checks that passed"
                      enterDelay={300}
                      enterTouchDelay={300}
                    >
                      <Typography variant="body2" sx={{ fontWeight: 'bold', color: theme.palette.success.main, cursor: 'help' }}>
                        {seoData.checks.filter(c => c.status === 'good').length}/{seoData.checks.length}
                      </Typography>
                    </Tooltip>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="body2">Warnings</Typography>
                    <Tooltip 
                      title="Number of SEO warnings found"
                      enterDelay={300}
                      enterTouchDelay={300}
                    >
                      <Typography variant="body2" sx={{ fontWeight: 'bold', color: theme.palette.warning.main, cursor: 'help' }}>
                        {seoData.checks.filter(c => c.status === 'warning').length}
                      </Typography>
                    </Tooltip>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="body2">Errors</Typography>
                    <Tooltip 
                      title="Number of SEO errors found"
                      enterDelay={300}
                      enterTouchDelay={300}
                    >
                      <Typography variant="body2" sx={{ fontWeight: 'bold', color: theme.palette.error.main, cursor: 'help' }}>
                        {seoData.checks.filter(c => c.status === 'error').length}
                      </Typography>
                    </Tooltip>
                  </Box>
                </Box>
              )}
            </CardContent>
          </Card>
        </Box>
      </Box>

      <Card sx={{ borderRadius: 2 }}>
        <CardContent sx={{ p: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
            <Target size={24} color={theme.palette.primary.main} style={{ marginRight: 8 }} />
            <Typography 
              variant="h6" 
              sx={{ 
                fontWeight: 'bold',
                fontSize: { xs: '1.1rem', sm: '1.25rem' }
              }}
            >
              SEO Recommendations
            </Typography>
          </Box>
          {seoLoading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', py: 3 }}>
              <CircularProgress size={32} sx={{ mr: 2 }} />
              <Typography variant="body2" color="text.secondary">
                Generating recommendations...
              </Typography>
            </Box>
          ) : seoError ? (
            <Typography variant="body2" color="error" sx={{ fontStyle: 'italic', textAlign: 'center', py: 3 }}>
              Recommendations unavailable
            </Typography>
          ) : !seoData ? (
            <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic', textAlign: 'center', py: 3 }}>
              Recommendations pending...
            </Typography>
          ) : (
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)' }, gap: 2 }}>
              {seoData.recommendations?.map((rec, index) => (
              <Tooltip 
                key={index} 
                title={getPriorityTooltip(rec.priority)}
                enterDelay={300}
                enterTouchDelay={300}
              >
                <Box sx={{ 
                  p: 2, 
                  border: `1px solid ${getPriorityColor(rec.priority)}`,
                  borderRadius: 1,
                  backgroundColor: `${getPriorityColor(rec.priority)}10`,
                  cursor: 'help'
                }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <Typography variant="subtitle2" sx={{ 
                      fontWeight: 'bold', 
                      color: getPriorityColor(rec.priority),
                      mr: 1
                    }}>
                      {rec.title}
                    </Typography>
                    <Chip 
                      label={rec.priority} 
                      size="small" 
                      variant="outlined"
                      sx={{ 
                        borderColor: getPriorityColor(rec.priority),
                        color: getPriorityColor(rec.priority),
                        fontWeight: 'medium',
                        fontSize: '0.75rem'
                      }}
                    />
                  </Box>
                  <Typography variant="body2" sx={{ color: 'rgba(0, 0, 0, 0.87)' }}>
                    {rec.description}
                  </Typography>
                </Box>
              </Tooltip>
              ))}
            </Box>
          )}
        </CardContent>
      </Card>

      {/* Additional SEO Data Sections - 2x2 Layout matching other tabs */}
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)' }, gap: 2, mt: 2 }}>
        {/* Keywords Section */}
        <Card sx={{ borderRadius: 2 }}>
          <CardContent sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
              <Hash size={24} color={theme.palette.primary.main} style={{ marginRight: 8 }} />
              <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                Top Keywords
              </Typography>
            </Box>
            {seoLoading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', py: 3 }}>
                <CircularProgress size={32} sx={{ mr: 2 }} />
                <Typography variant="body2" color="text.secondary">
                  Analyzing keywords...
                </Typography>
              </Box>
            ) : seoError ? (
              <Typography variant="body2" color="error" sx={{ fontStyle: 'italic', textAlign: 'center', py: 3 }}>
                Keywords unavailable
              </Typography>
            ) : !seoData || !seoData.keywords || seoData.keywords.length === 0 || seoData.keywords[0]?.keyword === '!analysis pending' ? (
              <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic', textAlign: 'center', py: 3 }}>
                No keywords detected
              </Typography>
            ) : (
              <TableContainer component={Paper} sx={{ boxShadow: 'none', border: '1px solid', borderColor: 'divider' }}>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Keyword</TableCell>
                      <TableCell align="right">Count</TableCell>
                      <TableCell align="right">Density</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {seoData.keywords.slice(0, 6).map((keyword, index) => (
                      <TableRow key={index}>
                        <TableCell component="th" scope="row">
                          {keyword.keyword}
                        </TableCell>
                        <TableCell align="right">{keyword.count}</TableCell>
                        <TableCell align="right">{keyword.density}%</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </CardContent>
        </Card>

        {/* Heading Hierarchy Section - Always show */}
        <Card sx={{ borderRadius: 2 }}>
          <CardContent sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
              <FileText size={24} color={theme.palette.primary.main} style={{ marginRight: 8 }} />
              <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                Heading Structure
              </Typography>
            </Box>
            {seoLoading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', py: 3 }}>
                <CircularProgress size={32} sx={{ mr: 2 }} />
                <Typography variant="body2" color="text.secondary">
                  Analyzing headings...
                </Typography>
              </Box>
            ) : seoError ? (
              <Typography variant="body2" color="error" sx={{ fontStyle: 'italic', textAlign: 'center', py: 3 }}>
                Heading analysis unavailable
              </Typography>
            ) : !seoData ? (
              <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic', textAlign: 'center', py: 3 }}>
                Heading analysis pending...
              </Typography>
            ) : (
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                {seoData.headings && Object.entries(seoData.headings).map(([level, count]) => (
                  <Box key={level} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="body2" sx={{ fontWeight: 'medium' }}>
                      {level.toUpperCase()}
                    </Typography>
                    <Tooltip
                      title={(typeof count === 'number' && count > 0) ? `${count} ${level.toUpperCase()} heading${count === 1 ? '' : 's'} found - good for SEO structure` : `No ${level.toUpperCase()} headings found - consider adding for better content hierarchy`}
                      enterDelay={300}
                      enterTouchDelay={300}
                    >
                      <Chip 
                        label={String(count)} 
                        size="small" 
                        color={(typeof count === 'number' && count > 0) ? 'success' : 'default'}
                        variant="outlined"
                        sx={{ cursor: 'help' }}
                      />
                    </Tooltip>
                  </Box>
                ))}
              </Box>
            )}
          </CardContent>
        </Card>

        {/* Technical SEO Status - Always show */}
        <Card sx={{ borderRadius: 2 }}>
          <CardContent sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
              <Globe size={24} color={theme.palette.primary.main} style={{ marginRight: 8 }} />
              <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                Technical SEO
              </Typography>
            </Box>
            {seoLoading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', py: 3 }}>
                <CircularProgress size={32} sx={{ mr: 2 }} />
                <Typography variant="body2" color="text.secondary">
                  Checking technical SEO...
                </Typography>
              </Box>
            ) : seoError ? (
              <Typography variant="body2" color="error" sx={{ fontStyle: 'italic', textAlign: 'center', py: 3 }}>
                Technical SEO check unavailable
              </Typography>
            ) : !seoData ? (
              <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic', textAlign: 'center', py: 3 }}>
                Technical SEO check pending...
              </Typography>
            ) : (
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant="body2">Robots.txt</Typography>
                  <Chip
                    label={seoData.hasRobotsTxt ? 'Present' : 'Missing'}
                    color={seoData.hasRobotsTxt ? 'success' : 'error'}
                    size="small"
                    variant="outlined"
                  />
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant="body2">XML Sitemap</Typography>
                  <Chip
                    label={seoData.hasSitemap ? 'Present' : 'Missing'}
                    color={seoData.hasSitemap ? 'success' : 'error'}
                    size="small"
                    variant="outlined"
                  />
                </Box>
                {seoData.structuredData && seoData.structuredData.length > 0 ? (
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="body2">Structured Data</Typography>
                    <Chip
                      label={`${seoData.structuredData.length} items`}
                      color="success"
                      size="small"
                      variant="outlined"
                    />
                  </Box>
                ) : (
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="body2">Structured Data</Typography>
                    <Chip
                      label="None detected"
                      color="default"
                      size="small"
                      variant="outlined"
                    />
                  </Box>
                )}
              </Box>
            )}
          </CardContent>
        </Card>

        {/* Meta Tags Section */}
        {seo?.metaTags && Object.keys(seo.metaTags).length > 0 && seo.metaTags.title !== '!Analysis pending' && (
          <Card sx={{ borderRadius: 2 }}>
            <CardContent sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                <Shield size={24} color={theme.palette.primary.main} style={{ marginRight: 8 }} />
                <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                  Meta Tags
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, maxHeight: 200, overflowY: 'auto' }}>
                {Object.entries(seo.metaTags).slice(0, 8).map(([key, value]) => (
                  <Box key={key} sx={{ pb: 1, borderBottom: '1px solid', borderColor: 'divider' }}>
                    <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 'bold' }}>
                      {key}
                    </Typography>
                    <Typography variant="body2" sx={{ wordBreak: 'break-word' }}>
                      {String(value).length > 60 ? `${String(value).substring(0, 60)}...` : String(value)}
                    </Typography>
                  </Box>
                ))}
              </Box>
            </CardContent>
          </Card>
        )}
      </Box>
    </Box>
  );
};

export default SEOAnalysisTab;

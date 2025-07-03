import React from 'react';
import { Box, Typography, Card, CardContent, Chip, CircularProgress, Alert, Tooltip } from '@mui/material';
import { CheckCircle, AlertCircle, XCircle, Search, Target, TrendingUp } from 'lucide-react';
import type { AnalysisResponse } from '@/types/analysis';
import { useTheme } from '@mui/material/styles';

interface SEOAnalysisTabProps {
  data: AnalysisResponse | null;
  loading: boolean;
  error: string | null;
}

const SEOAnalysisTab: React.FC<SEOAnalysisTabProps> = ({ data, loading, error }) => {
  const theme = useTheme();

  if (loading && !data) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', py: 8 }}>
        <CircularProgress size={60} />
        <Typography variant="h6" sx={{ ml: 2 }}>
          Analyzing SEO...
        </Typography>
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
        Enter a URL to analyze website SEO
      </Alert>
    );
  }

  const { seo } = data.data;
  if (!seo) return null;

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

  const seoScore = seo.score;
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
              <Search size={24} color="#FF6B35" style={{ marginRight: 8 }} />
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
              {seo.checks.map((check, index) => (
                <Box
                  key={index}
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    p: 2,
                    borderBottom: index < seo.checks.length - 1 ? '1px solid #E0E0E0' : 'none',
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
                <Target size={24} color="#FF6B35" style={{ marginRight: 8 }} />
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
            </CardContent>
          </Card>

          <Card sx={{ borderRadius: 2 }}>
            <CardContent sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                <TrendingUp size={24} color="#FF6B35" style={{ marginRight: 8 }} />
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
              <Box sx={{ mb: 2 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="body2">Checks Passed</Typography>
                  <Tooltip 
                    title="Number of SEO checks that passed"
                    enterDelay={300}
                    enterTouchDelay={300}
                  >
                    <Typography variant="body2" sx={{ fontWeight: 'bold', color: theme.palette.success.main, cursor: 'help' }}>
                      {seo.checks.filter(c => c.status === 'good').length}/{seo.checks.length}
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
                      {seo.checks.filter(c => c.status === 'warning').length}
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
                      {seo.checks.filter(c => c.status === 'error').length}
                    </Typography>
                  </Tooltip>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Box>
      </Box>

      <Card sx={{ borderRadius: 2 }}>
        <CardContent sx={{ p: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
            <Target size={24} color="#FF6B35" style={{ marginRight: 8 }} />
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
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)' }, gap: 2 }}>
            {seo.recommendations.map((rec, index) => (
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
                    <Tooltip 
                      title={getPriorityTooltip(rec.priority)}
                      enterDelay={300}
                      enterTouchDelay={300}
                    >
                      <Chip 
                        label={rec.priority} 
                        size="small" 
                        sx={{ 
                          backgroundColor: getPriorityColor(rec.priority),
                          color: 'white',
                          fontSize: '0.7rem',
                          cursor: 'help'
                        }}
                      />
                    </Tooltip>
                  </Box>
                  <Typography variant="body2" sx={{ color: 'rgba(0, 0, 0, 0.87)' }}>
                    {rec.description}
                  </Typography>
                </Box>
              </Tooltip>
            ))}
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
};

export default SEOAnalysisTab;

import React from 'react';
import { Box, Typography, Grid, Card, CardContent, Chip, CircularProgress, Alert } from '@mui/material';
import { CheckCircle, AlertCircle, XCircle } from 'lucide-react';
import type { AnalysisResponse } from '@/types/analysis';

interface SEOAnalysisTabProps {
  data: AnalysisResponse | null;
  loading: boolean;
  error: string | null;
}

const SEOAnalysisTab: React.FC<SEOAnalysisTabProps> = ({ data, loading, error }) => {
  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', py: 8 }}>
        <CircularProgress size={60} />
        <Typography variant="h6" sx={{ ml: 2 }}>Analyzing SEO...</Typography>
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

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'good':
        return <CheckCircle size={20} color="#4CAF50" />;
      case 'warning':
        return <AlertCircle size={20} color="#FF9800" />;
      case 'error':
        return <XCircle size={20} color="#F44336" />;
      default:
        return <CheckCircle size={20} color="#4CAF50" />;
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

  const getPriorityColor = (priority: string) => {
    switch (priority) {
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

  return (
    <Box>
      <Typography variant="h5" gutterBottom sx={{ fontWeight: 'bold', mb: 3 }}>
        SEO Analysis
      </Typography>

      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          <Card sx={{ borderRadius: 2 }}>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
                SEO Checklist
              </Typography>
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
                    <Box sx={{ mr: 2 }}>
                      {getStatusIcon(check.status)}
                    </Box>
                    <Box sx={{ flexGrow: 1 }}>
                      <Typography variant="subtitle1" sx={{ fontWeight: 'medium' }}>
                        {check.name}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {check.description}
                      </Typography>
                    </Box>
                    <Chip
                      label={check.status}
                      color={getStatusColor(check.status) as any}
                      variant="outlined"
                      size="small"
                    />
                  </Box>
                ))}
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card sx={{ borderRadius: 2, mb: 2 }}>
            <CardContent sx={{ p: 3, textAlign: 'center' }}>
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
                SEO Score
              </Typography>
              <Typography variant="h2" sx={{ 
                fontWeight: 'bold', 
                color: seo.score >= 80 ? '#4CAF50' : seo.score >= 60 ? '#FF9800' : '#F44336',
                mb: 1 
              }}>
                {seo.score}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {seo.score >= 80 ? 'Excellent SEO' : seo.score >= 60 ? 'Good SEO' : 'Needs Improvement'}
              </Typography>
            </CardContent>
          </Card>

          <Card sx={{ borderRadius: 2 }}>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
                Analysis Status
              </Typography>
              <Box sx={{ mb: 2 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="body2">Checks Passed</Typography>
                  <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                    {seo.checks.filter(c => c.status === 'good').length}/{seo.checks.length}
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="body2">Warnings</Typography>
                  <Typography variant="body2" sx={{ fontWeight: 'bold', color: '#FF9800' }}>
                    {seo.checks.filter(c => c.status === 'warning').length}
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="body2">Errors</Typography>
                  <Typography variant="body2" sx={{ fontWeight: 'bold', color: '#F44336' }}>
                    {seo.checks.filter(c => c.status === 'error').length}
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Box sx={{ mt: 3 }}>
        <Card sx={{ borderRadius: 2 }}>
          <CardContent sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
              SEO Recommendations
            </Typography>
            <Grid container spacing={2}>
              {seo.recommendations.map((rec, index) => (
                <Grid item xs={12} md={6} key={index}>
                  <Box sx={{ 
                    p: 2, 
                    border: `1px solid ${getPriorityColor(rec.priority)}`,
                    borderRadius: 1,
                    backgroundColor: `${getPriorityColor(rec.priority)}10`
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
                        sx={{ 
                          backgroundColor: getPriorityColor(rec.priority),
                          color: 'white',
                          fontSize: '0.7rem'
                        }}
                      />
                    </Box>
                    <Typography variant="body2" sx={{ color: 'rgba(0, 0, 0, 0.87)' }}>
                      {rec.description}
                    </Typography>
                  </Box>
                </Grid>
              ))}
            </Grid>
          </CardContent>
        </Card>
      </Box>
    </Box>
  );
};

export default SEOAnalysisTab;

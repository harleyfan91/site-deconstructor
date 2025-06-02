
import React from 'react';
import { Box, Typography, Grid, Card, CardContent, Chip } from '@mui/material';
import { CheckCircle, AlertCircle, XCircle } from 'lucide-react';

const SEOAnalysisTab = () => {
  const seoChecks = [
    { name: 'Meta Title', status: 'good', description: 'Title tag is present and optimized' },
    { name: 'Meta Description', status: 'good', description: 'Description is compelling and within limits' },
    { name: 'H1 Tag', status: 'good', description: 'Single H1 tag found and relevant' },
    { name: 'Image Alt Text', status: 'warning', description: '3 images missing alt text' },
    { name: 'Internal Links', status: 'good', description: 'Good internal linking structure' },
    { name: 'Mobile Friendly', status: 'good', description: 'Page is mobile responsive' },
    { name: 'Page Speed', status: 'warning', description: 'Could be improved for better rankings' },
    { name: 'SSL Certificate', status: 'good', description: 'HTTPS is properly configured' },
  ];

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
                {seoChecks.map((check, index) => (
                  <Box
                    key={index}
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      p: 2,
                      borderBottom: index < seoChecks.length - 1 ? '1px solid #E0E0E0' : 'none',
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
              <Typography variant="h2" sx={{ fontWeight: 'bold', color: '#4CAF50', mb: 1 }}>
                92
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Excellent SEO
              </Typography>
            </CardContent>
          </Card>

          <Card sx={{ borderRadius: 2 }}>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
                Quick Stats
              </Typography>
              <Box sx={{ mb: 2 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="body2">Keyword Density</Typography>
                  <Typography variant="body2" sx={{ fontWeight: 'bold' }}>2.3%</Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="body2">Readability Score</Typography>
                  <Typography variant="body2" sx={{ fontWeight: 'bold' }}>85/100</Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="body2">Word Count</Typography>
                  <Typography variant="body2" sx={{ fontWeight: 'bold' }}>1,247</Typography>
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
              <Grid item xs={12} md={6}>
                <Box sx={{ p: 2, backgroundColor: '#FFF3E0', borderRadius: 1 }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 'bold', color: '#E65100', mb: 1 }}>
                    Add Alt Text to Images
                  </Typography>
                  <Typography variant="body2"
                    sx={{ color: 'rgba(0, 0, 0, 0.87)' }}>
                    3 images are missing alt text. This impacts accessibility and SEO.
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={12} md={6}>
                <Box sx={{ p: 2, backgroundColor: '#E8F5E8', borderRadius: 1 }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 'bold', color: '#2E7D32', mb: 1 }}>
                    Great Schema Markup
                  </Typography>
                  <Typography variant="body2"
                    sx={{ color: 'rgba(0, 0, 0, 0.87)' }}>
                    Structured data is properly implemented for better search visibility.
                  </Typography>
                </Box>
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      </Box>
    </Box>
  );
};

export default SEOAnalysisTab;

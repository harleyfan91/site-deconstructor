
import React from 'react';
import { Box, Typography, Grid, Card, CardContent, CircularProgress, Alert } from '@mui/material';
import { TrendingUp, Users, Clock, Star } from 'lucide-react';
import type { AnalysisResponse } from '@/types/analysis';

interface OverviewTabProps {
  data: AnalysisResponse | null;
  loading: boolean;
  error: string | null;
}

const OverviewTab: React.FC<OverviewTabProps> = ({ data, loading, error }) => {
  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', py: 8 }}>
        <CircularProgress size={60} />
        <Typography variant="h6" sx={{ ml: 2 }}>Analyzing website...</Typography>
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
        Enter a URL to analyze a website
      </Alert>
    );
  }

  const metrics = [
    {
      title: 'Overall Score',
      value: `${data.data.overview.overallScore}/100`,
      icon: Star,
      color: data.data.overview.overallScore >= 80 ? '#4CAF50' : data.data.overview.overallScore >= 60 ? '#FF9800' : '#F44336',
      description: data.data.overview.overallScore >= 80 ? 'Excellent performance overall' : data.data.overview.overallScore >= 60 ? 'Good, could be improved' : 'Needs improvement'
    },
    {
      title: 'Page Load Time',
      value: data.data.overview.pageLoadTime,
      icon: Clock,
      color: '#FF9800',
      description: 'Page loading performance'
    },
    {
      title: 'SEO Score',
      value: `${data.data.overview.seoScore}/100`,
      icon: TrendingUp,
      color: data.data.overview.seoScore >= 80 ? '#4CAF50' : data.data.overview.seoScore >= 60 ? '#FF9800' : '#F44336',
      description: data.data.overview.seoScore >= 80 ? 'Excellent SEO optimization' : 'SEO could be improved'
    },
    {
      title: 'User Experience',
      value: `${data.data.overview.userExperienceScore}/100`,
      icon: Users,
      color: data.data.overview.userExperienceScore >= 80 ? '#4CAF50' : '#2196F3',
      description: data.data.overview.userExperienceScore >= 80 ? 'Excellent user experience' : 'Good user experience'
    }
  ];

  return (
    <Box>
      <Typography variant="h5" gutterBottom sx={{ fontWeight: 'bold', mb: 3 }}>
        Website Overview - {data.url}
      </Typography>
      
      <Grid container spacing={3}>
        {metrics.map((metric, index) => {
          const IconComponent = metric.icon;
          return (

            <Grid item xs={12} sm={6} md={6} key={index}>

              <Card sx={{ height: '100%', borderRadius: 2 }}>
                <CardContent sx={{ p: 3 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <Box
                      sx={{
                        p: 1,
                        borderRadius: 1,
                        backgroundColor: `${metric.color}20`,
                        color: metric.color,
                        mr: 2
                      }}
                    >
                      <IconComponent size={24} />
                    </Box>
                    <Typography variant="h6" component="div" sx={{ fontWeight: 'bold' }}>
                      {metric.value}
                    </Typography>
                  </Box>
                  <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 'medium' }}>
                    {metric.title}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {metric.description}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          );
        })}
      </Grid>

      <Box sx={{ mt: 4 }}>
        <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
          Analysis Summary
        </Typography>
        <Card sx={{ borderRadius: 2 }}>
          <CardContent sx={{ p: 3 }}>
            <Typography variant="body1" paragraph>
              Analysis completed at {new Date(data.timestamp).toLocaleString()}. 
              {data.data.overview.overallScore >= 80 ? 
                ' The page shows excellent performance across most metrics.' :
                ' The page has room for improvement in several areas.'
              }
            </Typography>
            <Typography variant="body1" paragraph>
              <strong>Key Findings:</strong>
            </Typography>
            <Box component="ul" sx={{ pl: 2 }}>
              <Typography component="li" variant="body2" sx={{ mb: 1 }}>
                SEO Score: {data.data.overview.seoScore}/100
              </Typography>
              <Typography component="li" variant="body2" sx={{ mb: 1 }}>
                Page Load Time: {data.data.overview.pageLoadTime}
              </Typography>
              <Typography component="li" variant="body2" sx={{ mb: 1 }}>
                User Experience Score: {data.data.overview.userExperienceScore}/100
              </Typography>
            </Box>
          </CardContent>
        </Card>
      </Box>
    </Box>
  );
};

export default OverviewTab;

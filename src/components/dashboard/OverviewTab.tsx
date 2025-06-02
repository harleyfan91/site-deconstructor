
import React from 'react';
import { Box, Typography, Grid, Card, CardContent } from '@mui/material';
import { TrendingUp, Users, Clock, Star } from 'lucide-react';

const OverviewTab = () => {
  const metrics = [
    {
      title: 'Overall Score',
      value: '87/100',
      icon: Star,
      color: '#4CAF50',
      description: 'Excellent performance overall'
    },
    {
      title: 'Page Load Time',
      value: '2.3s',
      icon: Clock,
      color: '#FF9800',
      description: 'Good, could be improved'
    },
    {
      title: 'SEO Score',
      value: '92/100',
      icon: TrendingUp,
      color: '#4CAF50',
      description: 'Excellent SEO optimization'
    },
    {
      title: 'User Experience',
      value: '85/100',
      icon: Users,
      color: '#2196F3',
      description: 'Good user experience'
    }
  ];

  return (
    <Box>
      <Typography variant="h5" gutterBottom sx={{ fontWeight: 'bold', mb: 3 }}>
        Website Overview
      </Typography>
      
      <Grid container spacing={3}>
        {metrics.map((metric, index) => {
          const IconComponent = metric.icon;
          return (
            <Grid item xs={12} sm={6} md={3} key={index}>
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
              Your website shows strong performance across most metrics. The SEO optimization is excellent, 
              and the overall user experience is good. 
            </Typography>
            <Typography variant="body1" paragraph>
              <strong>Key Recommendations:</strong>
            </Typography>
            <Box component="ul" sx={{ pl: 2 }}>
              <Typography component="li" variant="body2" sx={{ mb: 1 }}>
                Optimize image loading to improve page speed
              </Typography>
              <Typography component="li" variant="body2" sx={{ mb: 1 }}>
                Consider implementing lazy loading for below-the-fold content
              </Typography>
              <Typography component="li" variant="body2" sx={{ mb: 1 }}>
                Review and optimize largest contentful paint (LCP)
              </Typography>
            </Box>
          </CardContent>
        </Card>
      </Box>
    </Box>
  );
};

export default OverviewTab;

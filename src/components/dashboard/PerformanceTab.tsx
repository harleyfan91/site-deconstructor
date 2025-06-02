
import React from 'react';
import { Box, Typography, Grid, Card, CardContent, LinearProgress } from '@mui/material';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '../ui/chart';
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer } from 'recharts';

const PerformanceTab = () => {
  const performanceData = [
    { name: 'First Contentful Paint', value: 1.2, benchmark: 1.8 },
    { name: 'Largest Contentful Paint', value: 2.3, benchmark: 2.5 },
    { name: 'Time to Interactive', value: 3.1, benchmark: 3.8 },
    { name: 'Cumulative Layout Shift', value: 0.08, benchmark: 0.1 },
  ];

  const chartConfig = {
    value: { label: 'Your Site', color: '#2196F3' },
    benchmark: { label: 'Industry Average', color: '#E0E0E0' }
  };

  const getScoreColor = (score: number) => {
    if (score >= 90) return '#4CAF50';
    if (score >= 70) return '#FF9800';
    return '#F44336';
  };

  return (
    <Box>
      <Typography variant="h5" gutterBottom sx={{ fontWeight: 'bold', mb: 3 }}>
        Performance Analysis
      </Typography>

      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          <Card sx={{ borderRadius: 2, height: '400px' }}>
            <CardContent sx={{ p: 3, height: '100%' }}>
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
                Core Web Vitals
              </Typography>
              <ChartContainer config={chartConfig} className="h-80">
                <BarChart data={performanceData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                  <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                  <YAxis />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Bar dataKey="value" fill="var(--color-value)" />
                  <Bar dataKey="benchmark" fill="var(--color-benchmark)" />
                </BarChart>
              </ChartContainer>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card sx={{ borderRadius: 2, mb: 2 }}>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
                Performance Score
              </Typography>
              <Box sx={{ textAlign: 'center', py: 2 }}>
                <Typography variant="h2" sx={{ fontWeight: 'bold', color: getScoreColor(83) }}>
                  83
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Good Performance
                </Typography>
              </Box>
            </CardContent>
          </Card>

          <Card sx={{ borderRadius: 2 }}>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
                Speed Index
              </Typography>
              <Box sx={{ mb: 2 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="body2">Loading Speed</Typography>
                  <Typography variant="body2">78%</Typography>
                </Box>
                <LinearProgress variant="determinate" value={78} sx={{ height: 8, borderRadius: 4 }} />
              </Box>
              <Typography variant="body2" color="text.secondary">
                Your page loads faster than 78% of websites
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Box sx={{ mt: 3 }}>
        <Card sx={{ borderRadius: 2 }}>
          <CardContent sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
              Performance Recommendations
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <Box sx={{ p: 2, backgroundColor: '#FFF3E0', borderRadius: 1, mb: 2 }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 'bold', color: '#E65100' }}>
                    Optimize Images
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Compress and resize images to reduce load time by ~0.8s
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={12} md={6}>
                <Box sx={{ p: 2, backgroundColor: '#E8F5E8', borderRadius: 1, mb: 2 }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 'bold', color: '#2E7D32' }}>
                    Enable Caching
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Browser caching is properly configured
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

export default PerformanceTab;

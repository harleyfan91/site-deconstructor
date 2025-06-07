
import React from 'react';
import { Box, Typography, Grid2 as Grid, Card, CardContent, LinearProgress, CircularProgress, Alert, Chip } from '@mui/material';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '../ui/chart';
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer } from 'recharts';
import { Shield, Smartphone, Zap } from 'lucide-react';
import type { AnalysisResponse } from '@/types/analysis';

interface PerformanceTabProps {
  data: AnalysisResponse | null;
  loading: boolean;
  error: string | null;
}

const PerformanceTab: React.FC<PerformanceTabProps> = ({ data, loading, error }) => {
  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', py: 8 }}>
        <CircularProgress size={60} />
        <Typography variant="h6" sx={{ ml: 2 }}>Analyzing performance & security...</Typography>
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
        Enter a URL to analyze website performance & security
      </Alert>
    );
  }

  const { performance } = data.data;
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
        Performance & Security Analysis
      </Typography>

      {/* Performance Score Section */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid xs={12} md={4}>
          <Card sx={{ borderRadius: 2 }}>
            <CardContent sx={{ p: 3, textAlign: 'center' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 2 }}>
                <Zap size={24} color="#FF6B35" style={{ marginRight: 8 }} />
                <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                  Performance Score
                </Typography>
              </Box>
              <Typography variant="h2" sx={{ fontWeight: 'bold', color: getScoreColor(performance.performanceScore) }}>
                {performance.performanceScore}
              </Typography>
              <Typography variant="body2" color="text.primary">
                {performance.performanceScore >= 90 ? 'Excellent' : performance.performanceScore >= 70 ? 'Good' : 'Needs Improvement'} Performance
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid xs={12} md={4}>
          <Card sx={{ borderRadius: 2 }}>
            <CardContent sx={{ p: 3, textAlign: 'center' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 2 }}>
                <Smartphone size={24} color="#FF6B35" style={{ marginRight: 8 }} />
                <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                  Mobile Responsiveness
                </Typography>
              </Box>
              <Typography variant="h3" sx={{ fontWeight: 'bold', color: '#4CAF50' }}>
                —
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Not yet implemented
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid xs={12} md={4}>
          <Card sx={{ borderRadius: 2 }}>
            <CardContent sx={{ p: 3, textAlign: 'center' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 2 }}>
                <Shield size={24} color="#FF6B35" style={{ marginRight: 8 }} />
                <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                  Security Score
                </Typography>
              </Box>
              <Typography variant="h3" sx={{ fontWeight: 'bold', color: '#4CAF50' }}>
                —
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Based on security headers
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Core Web Vitals Section */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid xs={12} md={8}>
          <Card sx={{ borderRadius: 2, height: '400px' }}>
            <CardContent sx={{ p: 3, height: '100%' }}>
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
                Core Web Vitals
              </Typography>
              <ChartContainer config={chartConfig} className="h-80">
                <BarChart data={performance.coreWebVitals} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
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

        <Grid xs={12} md={4}>
          <Card sx={{ borderRadius: 2 }}>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
                Speed Index
              </Typography>
              <Box sx={{ mb: 2 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="body2">Loading Speed</Typography>
                  <Typography variant="body2">{performance.performanceScore}%</Typography>
                </Box>
                <LinearProgress variant="determinate" value={performance.performanceScore} sx={{ height: 8, borderRadius: 4 }} />
              </Box>
              <Typography variant="body2" color="text.secondary">
                Your page loads faster than {performance.performanceScore}% of websites
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Security Section */}
      <Box sx={{ mb: 4 }}>
        <Card sx={{ borderRadius: 2 }}>
          <CardContent sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
              Security Headers Analysis
            </Typography>
            <Grid container spacing={2}>
              {Object.entries(data.securityHeaders).map(([key, value]) => (
                <Grid xs={12} sm={6} md={4} key={key}>
                  <Box sx={{ 
                    p: 2, 
                    border: '1px solid #E0E0E0',
                    borderRadius: 1,
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                  }}>
                    <Typography variant="body2" sx={{ fontWeight: 'medium' }}>
                      {key.toUpperCase()}
                    </Typography>
                    <Chip 
                      label={value ? 'Present' : 'Missing'} 
                      color={value ? 'success' : 'error'} 
                      size="small" 
                      variant="outlined"
                    />
                  </Box>
                </Grid>
              ))}
            </Grid>
          </CardContent>
        </Card>
      </Box>

      {/* Performance Recommendations Section */}
      <Box sx={{ mt: 3 }}>
        <Card sx={{ borderRadius: 2 }}>
          <CardContent sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
              Performance Recommendations
            </Typography>
            <Grid container spacing={2}>
              {performance.recommendations.map((rec, index) => (
                <Grid xs={12} md={6} key={index}>
                  <Box sx={{ 
                    p: 2, 
                    backgroundColor: rec.type === 'warning' ? '#FFF3E0' : rec.type === 'error' ? '#FFEBEE' : '#E8F5E8', 
                    borderRadius: 1, 
                    mb: 2 
                  }}>
                    <Typography variant="subtitle2" sx={{ 
                      fontWeight: 'bold', 
                      color: rec.type === 'warning' ? '#E65100' : rec.type === 'error' ? '#C62828' : '#2E7D32',
                      mb: 1
                    }}>
                      {rec.title}
                    </Typography>
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

export default PerformanceTab;

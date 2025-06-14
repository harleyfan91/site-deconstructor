import React from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  LinearProgress,
  CircularProgress,
  Alert,
  Chip
} from '@mui/material';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '../ui/chart';
import { BarChart, Bar, XAxis, YAxis } from 'recharts';
import { Shield, Smartphone, Zap } from 'lucide-react';
import type { AnalysisResponse } from '@/types/analysis';
import LegendContainer from './LegendContainer';

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

  const metrics = [
    {
      title: 'Performance Score',
      value: performance.performanceScore.toString(),
      icon: Zap,
      color: getScoreColor(performance.performanceScore),
      description:
        performance.performanceScore >= 90
          ? 'Excellent Performance'
          : performance.performanceScore >= 70
            ? 'Good Performance'
            : 'Needs Improvement'
    },
    {
      title: 'Mobile Responsiveness',
      value: '—',
      icon: Smartphone,
      color: '#4CAF50',
      description: 'Not yet implemented'
    },
    {
      title: 'Security Score',
      value: '—',
      icon: Shield,
      color: '#4CAF50',
      description: 'Based on security headers'
    }
  ];

  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
        <Typography variant="h5" gutterBottom sx={{ fontWeight: 'bold', flexGrow: 1 }}>
          Performance & Security Analysis
        </Typography>
      </Box>
      {/* Performance Score Section */}
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(3, 1fr)' }, gap: 3, mb: 4 }}>
        {metrics.map((metric, index) => {
          const IconComponent = metric.icon;
          return (
            <Card key={index} sx={{ height: '100%', borderRadius: 2 }}>
              <CardContent sx={{ p: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 2 }}>
                  <IconComponent size={24} color="#FF6B35" style={{ marginRight: 8 }} />
                  <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                    {metric.title}
                  </Typography>
                </Box>
                <Typography
                  variant={metric.title === 'Performance Score' ? 'h2' : 'h3'}
                  sx={{ fontWeight: 'bold', color: metric.color, textAlign: 'center' }}
                >
                  {metric.value}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center' }}>
                  {metric.description}
                </Typography>
              </CardContent>
            </Card>
          );
        })}
      </Box>

      {/* Core Web Vitals Section */}
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '2fr 1fr' }, gap: 2, alignItems: 'stretch', mb: 4 }}>
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
      </Box>

      {/* Security Section */}
      <Box sx={{ mb: 4 }}>
        <Card sx={{ borderRadius: 2 }}>
          <CardContent sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
              Security Headers Analysis
            </Typography>
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(3, 1fr)' }, gap: 2 }}>
              {Object.entries(data.securityHeaders).map(([key, value]) => (
                <Box key={key} sx={{
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
              ))}
            </Box>
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
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)' }, gap: 2 }}>
              {performance.recommendations.map((rec, index) => (
                <Box key={index} sx={{
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
              ))}
            </Box>
          </CardContent>
        </Card>
      </Box>
    </Box>
  );
};

export default PerformanceTab;

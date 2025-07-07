import React from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  CircularProgress,
  Alert,
} from '@mui/material';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '../ui/chart';
import { BarChart as RechartsBarChart, Bar, XAxis, YAxis } from 'recharts';
import { useTheme } from '@mui/material/styles';
import { Shield, Smartphone, Zap, Activity, BarChart } from 'lucide-react';
import type { AnalysisResponse } from '@/types/analysis';
import { useAnalysisContext } from '../../contexts/AnalysisContext';

interface PerformanceTabProps {
  data: AnalysisResponse | null;
  loading: boolean;
  error: string | null;
}

// Helper to determine score color given a numeric score
const getScoreColor = (score: number) => {
  if (score >= 90) return '#4CAF50';
  if (score >= 70) return '#FF9800';
  return '#F44336';
};

const PerformanceTab: React.FC<PerformanceTabProps> = ({ data, loading, error }) => {
  const theme = useTheme();
  const { data: contextData } = useAnalysisContext();

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
  const mobileScore = contextData?.mobileResponsiveness?.score || 0;
  const securityScore = contextData?.lhr ? Math.round(contextData.lhr.categories.security.score * 100) : 0;
  const showLoadingForPerformance = loading || !performance?.coreWebVitals || performance.coreWebVitals.length === 0;

  const chartConfig = {
    value: { label: 'Your Site', color: '#FF6B35' },
    benchmark: { label: 'Benchmark', color: theme.palette.grey[300] }
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
        <Typography variant="h5" gutterBottom sx={{ fontWeight: 'bold', flexGrow: 1 }}>
          Performance & Security Analysis
        </Typography>
      </Box>

      {/* Main content - Performance Metrics first, Core Web Vitals second */}
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 2fr' }, gap: 2, mb: 2 }}>
        {/* Performance Metrics Card */}
        <Card sx={{ borderRadius: 2 }}>
          <CardContent sx={{ p: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <Zap size={24} color="#FF6B35" style={{ marginRight: 8 }} />
              <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                Performance Metrics
              </Typography>
            </Box>
            
            <Box sx={{ mb: 3 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography variant="body2">Performance Score</Typography>
                <Typography variant="h4" sx={{ color: getScoreColor(performance.performanceScore) }}>
                  {performance.performanceScore}
                </Typography>
              </Box>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                {performance.performanceScore >= 90 ? 'Excellent Performance' : 
                 performance.performanceScore >= 70 ? 'Good Performance' : 'Needs Improvement'}
              </Typography>
            </Box>

            <Box sx={{ mb: 3 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography variant="body2">Mobile Score</Typography>
                <Typography variant="h4" sx={{ color: getScoreColor(mobileScore) }}>
                  {mobileScore}%
                </Typography>
              </Box>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Mobile Responsiveness
              </Typography>
            </Box>

            <Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography variant="body2">Security Score</Typography>
                <Typography variant="h4" sx={{ color: getScoreColor(securityScore) }}>
                  {securityScore}%
                </Typography>
              </Box>
              <Typography variant="body2" color="text.secondary">
                Based on Lighthouse security audits
              </Typography>
            </Box>
          </CardContent>
        </Card>
        
        {/* Core Web Vitals Chart */}
        <Card sx={{ borderRadius: 2, height: '400px' }}>
          <CardContent sx={{ p: 2, height: '100%' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <BarChart size={24} color="#FF6B35" style={{ marginRight: 8 }} />
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold', lineHeight: 1.2 }}>
                Core Web Vitals
              </Typography>
            </Box>
            {showLoadingForPerformance ? (
              <Box display="flex" justifyContent="center" alignItems="center" height="300px">
                <CircularProgress size={40} />
                <Typography variant="body2" sx={{ ml: 2 }}>
                  Loading Core Web Vitals...
                </Typography>
              </Box>
            ) : (
              <ChartContainer config={chartConfig} className="h-80 w-full">
                <RechartsBarChart
                  data={performance.coreWebVitals}
                  margin={{ top: 20, right: 30, left: 10, bottom: 5 }}
                >
                  <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                  <YAxis domain={[0, 100]} />
                  <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
                  <Bar dataKey="value" fill="#FF6B35" />
                  <Bar dataKey="benchmark" fill={theme.palette.grey[300]} />
                </RechartsBarChart>
              </ChartContainer>
            )}
          </CardContent>
        </Card>
      </Box>

      {/* Secondary content - simple 2-column grid */}
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 2 }}>
        <Card sx={{ borderRadius: 2 }}>
          <CardContent sx={{ p: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <Smartphone size={24} color="#FF6B35" style={{ marginRight: 8 }} />
              <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                Mobile Analysis
              </Typography>
            </Box>
            <Typography variant="body2" color="text.secondary">
              Mobile responsiveness score: {mobileScore}%
            </Typography>
          </CardContent>
        </Card>
        
        <Card sx={{ borderRadius: 2 }}>
          <CardContent sx={{ p: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <Activity size={24} color="#FF6B35" style={{ marginRight: 8 }} />
              <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                Recommendations
              </Typography>
            </Box>
            <Typography variant="body2" color="text.secondary">
              {performance.recommendations?.length || 0} performance improvements suggested
            </Typography>
          </CardContent>
        </Card>
      </Box>
    </Box>
  );
};

export default PerformanceTab;
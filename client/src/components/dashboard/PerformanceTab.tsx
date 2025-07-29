import React from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Alert,
  Tooltip,
  Slider,
} from '@mui/material';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '../ui/chart';
import { BarChart as RechartsBarChart, Bar, XAxis, YAxis } from 'recharts';
import { useTheme } from '@mui/material/styles';
import { Shield, Smartphone, Zap, Activity, BarChart, Clock } from 'lucide-react';
import type { AnalysisResponse } from '@/types/analysis';
import { useAnalysisContext } from '../../contexts/AnalysisContext';
import ResponsiveLayoutProbe from './ResponsiveLayoutProbe';

interface PerformanceTabProps {
  data: AnalysisResponse | null;
  loading: boolean;
  error: string | null;
}

// Helper to determine score color given a numeric score
const getScoreColor = (score: number, theme: any) => {
  if (score >= 90) return theme.palette.success.main;
  if (score >= 70) return theme.palette.warning.main;
  return theme.palette.error.main;
};

// Helper to get full name for Core Web Vitals abbreviations
const getFullMetricName = (abbreviation: string) => {
  const metricNames: { [key: string]: string } = {
    'LCP': 'Largest Contentful Paint',
    'FID': 'First Input Delay',
    'CLS': 'Cumulative Layout Shift',
    'FCP': 'First Contentful Paint',
    'INP': 'Interaction to Next Paint',
    'TTFB': 'Time to First Byte'
  };
  return metricNames[abbreviation] || abbreviation;
};

// Custom tick component with tooltip
const CustomTick = (props: any) => {
  const { x, y, payload } = props;
  const fullName = getFullMetricName(payload.value);
  
  return (
    <Tooltip title={fullName} arrow placement="top">
      <g transform={`translate(${x},${y})`}>
        <text
          x={0}
          y={0}
          dy={16}
          textAnchor="middle"
          fill="#666"
          fontSize="10"
          style={{ cursor: 'help' }}
        >
          {payload.value}
        </text>
      </g>
    </Tooltip>
  );
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

  const { performance, overview } = data?.data || {};
  const tech = (data?.data as any)?.tech || {};
  const performanceScore = overview?.overallScore || 0;
  const mobileScore = Math.round(((performance as any)?.pageLoadTime?.mobile || 0) < 3000 ? 90 : 
                                 ((performance as any)?.pageLoadTime?.mobile || 0) < 5000 ? 70 : 50);
  const securityScore = tech?.lighthouseScore || 0;
  
  // Handle both old array format and new object format
  const coreWebVitals = performance?.coreWebVitals;
  const pageLoadTime = (performance as any)?.pageLoadTime;
  

  // Convert Core Web Vitals object to chart data
  const vitalsChartData = coreWebVitals ? [
    { name: 'LCP', value: Math.round((coreWebVitals as any)?.lcpMs || 0), benchmark: 2500 },
    { name: 'INP', value: Math.round((coreWebVitals as any)?.inpMs || 0), benchmark: 200 },
    { name: 'CLS', value: Math.round(((coreWebVitals as any)?.cls || 0) * 100), benchmark: 10 }
  ] : [];

  // Convert page load times to seconds with proper fallbacks
  const desktopTimeMs = pageLoadTime?.desktop || 0;
  const mobileTimeMs = pageLoadTime?.mobile || 0;
  const desktopTimeSec = Number(desktopTimeMs) / 1000;
  const mobileTimeSec = Number(mobileTimeMs) / 1000;

  const chartConfig = {
    value: { label: 'Your Site', color: theme.palette.primary.main },
    benchmark: { label: 'Benchmark', color: theme.palette.grey[300] }
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
        <Typography variant="h5" gutterBottom sx={{ flexGrow: 1 }}>
          Performance & Security Analysis
        </Typography>
      </Box>

      {/* Main content - Performance Metrics first, Core Web Vitals second */}
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 2fr' }, gap: 2, mb: 2 }}>
        {/* Performance Metrics Card */}
        <Card sx={{ borderRadius: 2 }}>
          <CardContent sx={{ p: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <Zap size={24} style={{ marginRight: 8, color: theme.palette.primary.main }} />
              <Typography variant="h6">
                Performance Metrics
              </Typography>
            </Box>
            
            <>
              <Box sx={{ mb: 3 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="body2">Performance Score</Typography>
                  <Typography variant="h4" sx={{ color: getScoreColor(performanceScore, theme) }}>
                    {performanceScore}
                  </Typography>
                </Box>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    {performanceScore >= 90 ? 'Excellent Performance' : 
                     performanceScore >= 70 ? 'Good Performance' : 'Needs Improvement'}
                  </Typography>
                </Box>

                <Box sx={{ mb: 3 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="body2">Mobile Score</Typography>
                    <Typography variant="h4" sx={{ color: getScoreColor(mobileScore, theme) }}>
                      {mobileScore}%
                    </Typography>
                  </Box>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    Mobile Responsiveness
                  </Typography>
                </Box>

                <Box sx={{ mb: 3 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="body2">Security Score</Typography>
                    <Typography variant="h4" sx={{ color: getScoreColor(securityScore, theme) }}>
                      {securityScore}%
                    </Typography>
                  </Box>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    Based on Lighthouse security audits
                  </Typography>
                </Box>

                {/* Page Load Time Toggle Slider */}
                {pageLoadTime && desktopTimeMs > 0 && mobileTimeMs > 0 && (
                  <Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                      <Clock size={20} style={{ marginRight: 8, color: theme.palette.primary.main }} />
                      <Typography variant="body2" sx={{ fontWeight: 'medium' }}>
                        Page Load Time
                      </Typography>
                    </Box>
                    <Box sx={{ px: 1 }}>
                      {/* Toggle Button Style Slider */}
                      <Box
                        sx={{
                          position: 'relative',
                          height: 36,
                          borderRadius: 6,
                          border: '2px solid',
                          borderColor: theme.palette.divider,
                          overflow: 'hidden',
                          backgroundColor: theme.palette.background.paper,
                          mb: 1
                        }}
                      >
                        {/* Desktop side */}
                        <Box
                          sx={{
                            position: 'absolute',
                            left: 0,
                            top: 0,
                            width: '50%',
                            height: '100%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            backgroundColor: '#FF6B35', // Bright orange for desktop
                            borderRadius: '4px 0 0 4px',
                          }}
                        >
                          <Typography variant="body2" sx={{ fontWeight: 'bold', color: 'white', fontSize: '0.8rem' }}>
                            Desktop: {desktopTimeSec.toFixed(1)}s
                          </Typography>
                        </Box>
                        
                        {/* Mobile side */}
                        <Box
                          sx={{
                            position: 'absolute',
                            right: 0,
                            top: 0,
                            width: '50%',
                            height: '100%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            backgroundColor: '#CC5429', // Darker orange for mobile
                            borderRadius: '0 4px 4px 0',
                          }}
                        >
                          <Typography variant="body2" sx={{ fontWeight: 'bold', color: 'white', fontSize: '0.8rem' }}>
                            Mobile: {mobileTimeSec.toFixed(1)}s
                          </Typography>
                        </Box>
                      </Box>
                      
                      <Typography variant="caption" color="text.secondary" sx={{ display: 'block', textAlign: 'center' }}>
                        {desktopTimeSec < 2 && mobileTimeSec < 3 ? 'Excellent performance' :
                         desktopTimeSec < 4 && mobileTimeSec < 6 ? 'Good performance' : 'Needs improvement'}
                      </Typography>
                    </Box>
                  </Box>
                )}
              </>
          </CardContent>
        </Card>
        
        {/* Core Web Vitals Chart */}
        <Card sx={{ borderRadius: 2, height: '400px' }}>
          <CardContent sx={{ p: 2, height: '100%' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <BarChart size={24} style={{ marginRight: 8, color: theme.palette.primary.main }} />
              <Typography variant="h6" gutterBottom sx={{ lineHeight: 1.2 }}>
                Core Web Vitals
              </Typography>
            </Box>
            <ChartContainer config={chartConfig} className="h-80 w-full">
                <RechartsBarChart
                  data={vitalsChartData}
                  margin={{ top: 20, right: 30, left: 10, bottom: 5 }}
                >
                  <XAxis dataKey="name" tick={<CustomTick />} />
                  <YAxis />
                  <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
                  <Bar dataKey="value" fill={theme.palette.primary.main} />
                  <Bar dataKey="benchmark" fill={theme.palette.grey[300]} />
                </RechartsBarChart>
              </ChartContainer>
          </CardContent>
        </Card>
      </Box>

      {/* Secondary content - simple 2-column grid */}
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 2 }}>
        <Card sx={{ borderRadius: 2 }}>
          <CardContent sx={{ p: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <Smartphone size={24} style={{ marginRight: 8, color: theme.palette.primary.main }} />
              <Typography variant="h6">
                Mobile Analysis
              </Typography>
            </Box>
            <>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography variant="body2">Mobile Score</Typography>
                <Typography variant="h4" sx={{ color: getScoreColor(mobileScore, theme) }}>
                  {mobileScore}%
                </Typography>
              </Box>
              <Typography variant="body2" color="text.secondary">
                {mobileScore >= 90 ? 'Excellent mobile experience' :
                 mobileScore >= 70 ? 'Good mobile experience' : 'Mobile needs improvement'}
              </Typography>
            </>
          </CardContent>
        </Card>
        
        <Card sx={{ borderRadius: 2 }}>
          <CardContent sx={{ p: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <Activity size={24} style={{ marginRight: 8, color: theme.palette.primary.main }} />
              <Typography variant="h6">
                Recommendations
              </Typography>
            </Box>
            <>
              <Typography variant="body2" sx={{ mb: 1 }}>
                Performance improvements available
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {performanceScore >= 90 ? 'Site is well optimized' :
                 performanceScore >= 70 ? 'Some optimizations possible' : 'Multiple improvements needed'}
              </Typography>
            </>
          </CardContent>
        </Card>
      </Box>

      {/* Responsive Layout Probe - New section */}
      <Box sx={{ mt: 3 }}>
        <ResponsiveLayoutProbe url={data?.data ? (data as any).url : undefined} />
      </Box>
    </Box>
  );
};

export default PerformanceTab;
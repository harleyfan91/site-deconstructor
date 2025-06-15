import React, { useRef, useEffect, useState } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  LinearProgress,
  CircularProgress,
  Alert,
  Chip,
} from '@mui/material';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '../ui/chart';
import { BarChart as RechartsBarChart, Bar, XAxis, YAxis } from 'recharts';
import { Shield, Smartphone, Zap, Activity, ShieldCheck, Gauge, BarChart } from 'lucide-react';
import type { AnalysisResponse } from '@/types/analysis';
import { useIsMobile } from '@/hooks/use-mobile';

// Helper to determine score color given a numeric score
const getScoreColor = (score: number) => {
  if (score >= 90) return '#4CAF50';
  if (score >= 70) return '#FF9800';
  return '#F44336';
};

// Renders a single metric card for performance, mobile, or security metrics
function MetricCard({
  icon: IconComponent,
  title,
  value,
  color,
  description,
}: {
  icon: React.ElementType;
  title: string;
  value: string;
  color: string;
  description: string;
}) {
  return (
    <Card sx={{ height: '100%', borderRadius: 2 }}>
      <CardContent sx={{ p: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <IconComponent size={24} color="#FF6B35" style={{ marginRight: 8 }} />
          <Typography variant="h6" sx={{ fontWeight: 'bold', lineHeight: 1.2 }}>
            {title}
          </Typography>
        </Box>
        <Typography
          variant={title === 'Performance Score' ? 'h2' : 'h3'}
          sx={{ fontWeight: 'bold', color, textAlign: 'center', mb: 1 }}
        >
          {value}
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center' }}>
          {description}
        </Typography>
      </CardContent>
    </Card>
  );
}

// Renders the section with multiple metric cards at the top of the panel
function MetricsSection({ performanceScore }: { performanceScore: number }) {
  const metrics = [
    {
      title: 'Performance Score',
      value: performanceScore.toString(),
      icon: Zap,
      color: getScoreColor(performanceScore),
      description:
        performanceScore >= 90
          ? 'Excellent Performance'
          : performanceScore >= 70
          ? 'Good Performance'
          : 'Needs Improvement',
    },
    {
      title: 'Mobile Responsiveness',
      value: '—',
      icon: Smartphone,
      color: '#4CAF50',
      description: 'Not yet implemented',
    },
    {
      title: 'Security Score',
      value: '—',
      icon: Shield,
      color: '#4CAF50',
      description: 'Based on security headers',
    },
  ];
  return (
    <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(3, 1fr)' }, gap: 3, mb: 4 }}>
      {metrics.map((metric, idx) => (
        <MetricCard key={idx} {...metric} />
      ))}
    </Box>
  );
}

// External Y-axis component for mobile
function ExternalYAxis({ domain, chartHeight, chartMargins }: {
  domain: [number, number];
  chartHeight: number;
  chartMargins: { top: number; bottom: number };
}) {
  const [yMin, yMax] = domain;
  if (yMax <= yMin) return null;

  const ticks = [];
  const tickIncrement = 25;
  for (let i = yMin; i <= yMax; i += tickIncrement) {
    ticks.push(i);
  }

  const plotAreaHeight = chartHeight - chartMargins.top - chartMargins.bottom;
  const renderedLabelHeight = 16; // Estimated height of the label to prevent clipping

  return (
    <Box
      sx={{
        width: '50px',
        height: `${chartHeight}px`,
        paddingTop: `${chartMargins.top}px`,
        paddingBottom: `${chartMargins.bottom}px`,
        paddingRight: '8px',
        borderRight: '1px solid #E0E0E0',
        zIndex: 10,
        boxSizing: 'border-box'
      }}
    >
      <Box
        sx={{
          height: `${plotAreaHeight}px`,
          position: 'relative',
        }}
      >
        {ticks.map((tick, index) => {
          const positionRatio = (yMax > yMin) ? (tick - yMin) / (yMax - yMin) : 0;
          // Position the top of the label within the drawable area.
          const topOffset = (1 - positionRatio) * (plotAreaHeight - renderedLabelHeight);

          return (
            <Typography
              key={index}
              variant="caption"
              sx={{
                position: 'absolute',
                top: `${topOffset}px`,
                right: 0,
                fontSize: '12px',
                color: 'text.secondary',
                lineHeight: 1,
              }}
            >
              {Math.round(tick)}
            </Typography>
          );
        })}
      </Box>
    </Box>
  );
}


// Renders the main chart (Core Web Vitals) card
function CoreWebVitalsSection({ performance }: { performance: AnalysisResponse["data"]["performance"] }) {
  const chartRef = useRef<HTMLDivElement>(null);
  const [chartDimensions, setChartDimensions] = useState({ height: 320, margins: { top: 20, bottom: 20 } });
  const isMobile = useIsMobile();
  
  useEffect(() => {
    const updateDimensions = () => {
      if (chartRef.current) {
        setChartDimensions({
          height: 320,
          margins: { top: 20, bottom: 20 }
        });
      }
    };
    
    updateDimensions();
    window.addEventListener('resize', updateDimensions);
    return () => window.removeEventListener('resize', updateDimensions);
  }, []);

  const allValues = performance.coreWebVitals.flatMap(item => [item.value || 0, item.benchmark || 0]);
  const maxValue = Math.max(...allValues, 0);
  const yMax = Math.ceil(Math.max(100, maxValue) / 25) * 25;
  const yDomain: [number, number] = [0, yMax];

  const chartConfig = {
    value: { label: 'Your Site', color: '#2196F3' },
    benchmark: { label: 'Industry Average', color: '#E0E0E0' }
  };

  const chartContent = (
    <ChartContainer config={chartConfig} className="h-80">
      <RechartsBarChart 
        data={performance.coreWebVitals} 
        margin={{ top: 20, right: 30, left: isMobile ? 0 : 20, bottom: 20 }}
      >
        <XAxis dataKey="name" tick={{ fontSize: 12 }} />
        <YAxis domain={yDomain} hide={isMobile} />
        <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
        <Bar dataKey="value" fill="var(--color-value)" />
        <Bar dataKey="benchmark" fill="var(--color-benchmark)" />
      </RechartsBarChart>
    </ChartContainer>
  );

  return (
    <Card sx={{ borderRadius: 2, height: '400px' }}>
      <CardContent sx={{ p: 3, height: '100%' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <BarChart size={24} color="#FF6B35" style={{ marginRight: 8 }} />
          <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold', lineHeight: 1.2 }}>
            Core Web Vitals
          </Typography>
        </Box>
        
        {isMobile ? (
          <Box sx={{ 
            display: 'grid', 
            gridTemplateColumns: 'auto 1fr',
            height: 'calc(100% - 60px)',
            overflow: 'hidden'
          }}>
            <ExternalYAxis 
              domain={yDomain}
              chartHeight={chartDimensions.height}
              chartMargins={chartDimensions.margins}
            />
            <Box sx={{ overflowX: 'auto', minWidth: 0 }}>
              <Box 
                ref={chartRef}
                sx={{
                  minWidth: '520px',
                  height: `${chartDimensions.height}px`
                }}
              >
                {chartContent}
              </Box>
            </Box>
          </Box>
        ) : (
          <Box sx={{ overflowX: 'auto', width: '100%', pb: 1 }}>
            <Box sx={{
              minWidth: { xs: 520, sm: 600 },
              width: { xs: 520, sm: 600, md: '100%' },
              maxWidth: 'none'
            }}>
              {chartContent}
            </Box>
          </Box>
        )}
      </CardContent>
    </Card>
  );
}

// Renders Speed Index panel
function SpeedIndexSection({ performanceScore }: { performanceScore: number }) {
  return (
    <Card sx={{ borderRadius: 2 }}>
      <CardContent sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <Gauge size={24} color="#FF6B35" style={{ marginRight: 8 }} />
          <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold', lineHeight: 1.2 }}>
            Speed Index
          </Typography>
        </Box>
        <Box sx={{ mb: 2 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
            <Typography variant="body2">Loading Speed</Typography>
            <Typography variant="body2">{performanceScore}%</Typography>
          </Box>
          <LinearProgress variant="determinate" value={performanceScore} sx={{ height: 8, borderRadius: 4 }} />
        </Box>
        <Typography variant="body2" color="text.secondary">
          Your page loads faster than {performanceScore}% of websites
        </Typography>
      </CardContent>
    </Card>
  );
}

// Security headers grid
function SecurityHeadersSection({ securityHeaders }: { securityHeaders: AnalysisResponse["securityHeaders"] }) {
  return (
    <Card sx={{ borderRadius: 2 }}>
      <CardContent sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <ShieldCheck size={24} color="#FF6B35" style={{ marginRight: 8 }} />
          <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold', lineHeight: 1.2 }}>
            Security Headers Analysis
          </Typography>
        </Box>
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(3, 1fr)' }, gap: 2 }}>
          {Object.entries(securityHeaders).map(([key, value]) => (
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
  );
}

// Recommendations
function RecommendationsSection({ recommendations }: { recommendations: AnalysisResponse["data"]["performance"]["recommendations"] }) {
  return (
    <Card sx={{ borderRadius: 2 }}>
      <CardContent sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <Activity size={24} color="#FF6B35" style={{ marginRight: 8 }} />
          <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold', lineHeight: 1.2 }}>
            Performance Recommendations
          </Typography>
        </Box>
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)' }, gap: 2 }}>
          {recommendations.map((rec, index) => (
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
  );
}

// --- Main component ---
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

  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
        <Typography variant="h5" gutterBottom sx={{ fontWeight: 'bold', flexGrow: 1 }}>
          Performance & Security Analysis
        </Typography>
      </Box>

      {/* Performance Score Section */}
      <MetricsSection performanceScore={performance.performanceScore} />

      {/* Core Web Vitals and Speed Index */}
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '2fr 1fr' }, gap: 2, alignItems: 'stretch', mb: 4 }}>
        <CoreWebVitalsSection performance={performance} />
        <SpeedIndexSection performanceScore={performance.performanceScore} />
      </Box>

      {/* Security Section */}
      <Box sx={{ mb: 4 }}>
        <SecurityHeadersSection securityHeaders={data.securityHeaders} />
      </Box>

      {/* Performance Recommendations Section */}
      <Box sx={{ mt: 3 }}>
        <RecommendationsSection recommendations={performance.recommendations} />
      </Box>
    </Box>
  );
};

export default PerformanceTab;

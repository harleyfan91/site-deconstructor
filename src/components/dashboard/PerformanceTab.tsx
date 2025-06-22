import React from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  LinearProgress,
  CircularProgress,
  Alert,
  Chip,
  Tooltip,
} from '@mui/material';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '../ui/chart';
import { BarChart as RechartsBarChart, Bar, XAxis, YAxis } from 'recharts';
import { Shield, Smartphone, Zap, Activity, ShieldCheck, Gauge, BarChart } from 'lucide-react';
import type { AnalysisResponse } from '@/types/analysis';
import { useAnalysisContext } from '../../contexts/AnalysisContext';

// Helper to determine score color given a numeric score
const getScoreColor = (score: number) => {
  if (score >= 90) return '#4CAF50';
  if (score >= 70) return '#FF9800';
  return '#F44336';
};

// Helper to get score tooltip text
const getScoreTooltip = (score: number) => {
  if (score >= 90) return 'Excellent performance (90+)';
  if (score >= 70) return 'Good performance (70-89)';
  return 'Needs improvement (<70)';
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
        <Tooltip 
          title={title === 'Performance Score' ? getScoreTooltip(parseInt(value)) : description}
          enterDelay={300}
          enterTouchDelay={300}
        >
          <Typography
            variant={title === 'Performance Score' ? 'h2' : 'h3'}
            sx={{ fontWeight: 'bold', color, textAlign: 'center', mb: 1, cursor: 'help' }}
          >
            {value}
          </Typography>
        </Tooltip>
        <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center' }}>
          {description}
        </Typography>
      </CardContent>
    </Card>
  );
}

// Renders the section with multiple metric cards at the top of the panel
function MetricsSection({ performanceScore, mobileScore, securityGrade }: { 
  performanceScore: number; 
  mobileScore: number; 
  securityGrade: string; 
}) {
  const getGradeColor = (grade: string) => {
    switch (grade) {
      case 'A': return '#4CAF50';
      case 'B': return '#2196F3';
      case 'C': return '#FF9800';
      case 'D': case 'F': return '#F44336';
      default: return '#9E9E9E';
    }
  };

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
      title: 'Mobile Score',
      value: `${mobileScore}%`,
      icon: Smartphone,
      color: getScoreColor(mobileScore),
      description: 'Mobile Responsiveness',
    },
    {
      title: 'Security Grade',
      value: securityGrade,
      icon: Shield,
      color: getGradeColor(securityGrade),
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

// Renders the main chart (Core Web Vitals) card
function CoreWebVitalsSection({ performance }: { performance: AnalysisResponse["data"]["performance"] }) {
  const chartConfig = {
    value: { label: 'Your Site', color: '#2196F3' },
    benchmark: { label: 'Industry Average', color: '#E0E0E0' }
  };
  return (
    <Card sx={{ borderRadius: 2, height: '400px' }}>
      <CardContent sx={{ p: 3, height: '100%' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <BarChart size={24} color="#FF6B35" style={{ marginRight: 8 }} />
          <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold', lineHeight: 1.2 }}>
            Core Web Vitals
          </Typography>
        </Box>
        <Box sx={{ overflowX: 'auto', width: '100%', pb: 1 }}>
          <Box sx={{
            minWidth: { xs: 520, sm: 600 },
            width: { xs: 520, sm: 600, md: '100%' },
            maxWidth: 'none'
          }}>
            <ChartContainer config={chartConfig} className="h-80">
              <RechartsBarChart data={performance.coreWebVitals} margin={{ top: 20, right: 30, left: 5, bottom: 5 }} barCategoryGap="20%">
                <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                <YAxis />
                <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
                <Bar dataKey="value" fill="var(--color-value)" maxBarSize={40} />
                <Bar dataKey="benchmark" fill="var(--color-benchmark)" maxBarSize={40} />
              </RechartsBarChart>
            </ChartContainer>
          </Box>
        </Box>
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
            <Tooltip 
              title={getScoreTooltip(performanceScore)}
              enterDelay={300}
              enterTouchDelay={300}
            >
              <Typography variant="body2" sx={{ cursor: 'help' }}>{performanceScore}%</Typography>
            </Tooltip>
          </Box>
          <Tooltip 
            title={getScoreTooltip(performanceScore)}
            enterDelay={300}
            enterTouchDelay={300}
          >
            <LinearProgress variant="determinate" value={performanceScore} sx={{ height: 8, borderRadius: 4, cursor: 'help' }} />
          </Tooltip>
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
            <Box
              key={key}
              sx={{
                p: 2,
                border: '1px solid rgba(0,0,0,0.1)',
                bgcolor: 'background.paper',
                borderRadius: 1,
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}
            >
              <Typography variant="body2" sx={{ fontWeight: 'medium' }}>
                {key.toUpperCase()}
              </Typography>
              <Tooltip 
                title={value ? 'Security header is present and configured' : 'Security header is missing - this may be a security risk'}
                enterDelay={300}
                enterTouchDelay={300}
              >
                <Chip
                  label={value ? 'Present' : 'Missing'}
                  color={value ? 'success' : 'error'}
                  size="small"
                  variant="outlined"
                  sx={{ cursor: 'help' }}
                />
              </Tooltip>
            </Box>
          ))}
        </Box>
      </CardContent>
    </Card>
  );
}

// Mobile Responsiveness Section
function MobileResponsivenessSection() {
  const { data, loading, error } = useAnalysisContext();

  if (loading) {
    return (
      <Card sx={{ borderRadius: 2 }}>
        <CardContent sx={{ p: 3 }}>
          <Box display="flex" alignItems="center" mb={2}>
            <Smartphone size={24} color="#FF6B35" style={{ marginRight: 8 }} />
            <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
              Mobile Responsiveness Details
            </Typography>
          </Box>
          <Box display="flex" justifyContent="center" alignItems="center" py={2}>
            <CircularProgress size={24} />
            <Typography variant="body2" sx={{ ml: 2 }}>
              Analyzing mobile responsiveness...
            </Typography>
          </Box>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card sx={{ borderRadius: 2 }}>
        <CardContent sx={{ p: 3 }}>
          <Alert severity="error">
            Error loading mobile responsiveness data: {error}
          </Alert>
        </CardContent>
      </Card>
    );
  }

  const { score = 0, issues = [] } = data?.mobileResponsiveness || {};

  return (
    <Card sx={{ borderRadius: 2 }}>
      <CardContent sx={{ p: 3 }}>
        <Box display="flex" alignItems="center" mb={2}>
          <Smartphone size={24} color="#FF6B35" style={{ marginRight: 8 }} />
          <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
            Mobile Responsiveness Details
          </Typography>
        </Box>
        
        <Box mb={3}>
          <Box display="flex" alignItems="center" mb={1}>
            <Typography variant="body2" sx={{ mr: 2 }}>Mobile Performance Score</Typography>
            <Typography variant="h4" color="primary">
              {score}%
            </Typography>
          </Box>
          <LinearProgress 
            variant="determinate" 
            value={score} 
            sx={{ height: 8, borderRadius: 4 }}
          />
        </Box>

        <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 'bold' }}>
          Detected Issues
        </Typography>
        
        {issues.length > 0 ? (
          issues.map((issue, idx) => (
            <Card key={idx} sx={{ mb: 1, backgroundColor: 'warning.light' }}>
              <CardContent sx={{ py: 1.5 }}>
                <Typography variant="subtitle2" color="warning.dark" gutterBottom>
                  {issue.title}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {issue.description}
                </Typography>
              </CardContent>
            </Card>
          ))
        ) : (
          <Typography variant="body2" sx={{ fontStyle: 'italic', color: 'text.secondary' }}>
            No mobile issues detected.
          </Typography>
        )}
      </CardContent>
    </Card>
  );
}

// Security Score Section
function SecurityScoreSection() {
  const { data, loading, error } = useAnalysisContext();

  const getGradeColor = (grade: string) => {
    switch (grade) {
      case 'A': return '#4CAF50';
      case 'B': return '#2196F3';
      case 'C': return '#FF9800';
      case 'D': case 'F': return '#F44336';
      default: return '#9E9E9E';
    }
  };

  if (loading) {
    return (
      <Card sx={{ borderRadius: 2 }}>
        <CardContent sx={{ p: 3 }}>
          <Box display="flex" alignItems="center" mb={2}>
            <Shield size={24} color="#FF6B35" style={{ marginRight: 8 }} />
            <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
              Security Score Details
            </Typography>
          </Box>
          <Box display="flex" justifyContent="center" alignItems="center" py={2}>
            <CircularProgress size={24} />
            <Typography variant="body2" sx={{ ml: 2 }}>
              Analyzing security...
            </Typography>
          </Box>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card sx={{ borderRadius: 2 }}>
        <CardContent sx={{ p: 3 }}>
          <Alert severity="error">
            Error loading security data: {error}
          </Alert>
        </CardContent>
      </Card>
    );
  }

  const { grade = '—', findings = [] } = data?.securityScore || {};

  return (
    <Card sx={{ borderRadius: 2 }}>
      <CardContent sx={{ p: 3 }}>
        <Box display="flex" alignItems="center" mb={2}>
          <Shield size={24} color="#FF6B35" style={{ marginRight: 8 }} />
          <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
            Security Score Details
          </Typography>
        </Box>
        
        <Box sx={{ textAlign: 'center', mb: 3 }}>
          <Chip 
            label={`Grade: ${grade}`} 
            sx={{
              backgroundColor: getGradeColor(grade),
              color: 'white',
              fontSize: '1.2rem',
              py: 2,
              fontWeight: 'bold'
            }}
            size="medium"
          />
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            Overall Security Grade
          </Typography>
        </Box>

        <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 'bold' }}>
          Security Findings
        </Typography>
        
        {findings.length > 0 ? (
          findings.map((finding, i) => (
            <Card key={i} sx={{ mb: 1, backgroundColor: 'error.light' }}>
              <CardContent sx={{ py: 1.5 }}>
                <Typography variant="subtitle2" color="error.dark" gutterBottom>
                  {finding.title}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {finding.description}
                </Typography>
              </CardContent>
            </Card>
          ))
        ) : (
          <Typography variant="body2" sx={{ fontStyle: 'italic', color: 'text.secondary' }}>
            No security issues detected.
          </Typography>
        )}
      </CardContent>
    </Card>
  );
}

// Recommendations
function RecommendationsSection({ recommendations }: { recommendations: AnalysisResponse["data"]["performance"]["recommendations"] }) {
  const getRecommendationTooltip = (type: string) => {
    switch (type) {
      case 'error': return 'Critical issue - immediate attention required';
      case 'warning': return 'Important improvement needed';
      default: return 'Suggested optimization';
    }
  };

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
            <Tooltip 
              key={index} 
              title={getRecommendationTooltip(rec.type)}
              enterDelay={300}
              enterTouchDelay={300}
            >
              <Box sx={{
                p: 2,
                backgroundColor: rec.type === 'warning' ? '#FFF3E0' : rec.type === 'error' ? '#FFEBEE' : '#E8F5E8',
                borderRadius: 1,
                mb: 2,
                border: '1px solid rgba(0,0,0,0.1)',
                cursor: 'help'
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
            </Tooltip>
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
  const { data: contextData } = useAnalysisContext();

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

  // Make sure we destructure the right variable!
  const { performance } = data.data;
  const mobileScore = contextData?.mobileResponsiveness?.score || 0;
  const securityGrade = contextData?.securityScore?.grade || '—';

  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
        <Typography variant="h5" gutterBottom sx={{ fontWeight: 'bold', flexGrow: 1 }}>
          Performance & Security Analysis
        </Typography>
      </Box>

      {/* Performance Score Section */}
      <MetricsSection 
        performanceScore={performance.performanceScore} 
        mobileScore={mobileScore}
        securityGrade={securityGrade}
      />

      {/* Core Web Vitals and Speed Index */}
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '2fr 1fr' }, gap: 2, alignItems: 'stretch', mb: 4 }}>
        <CoreWebVitalsSection performance={performance} />
        <SpeedIndexSection performanceScore={performance.performanceScore} />
      </Box>

      {/* Mobile and Security Details */}
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 3, mb: 4 }}>
        <MobileResponsivenessSection />
        <SecurityScoreSection />
      </Box>

      {/* Security Headers Section */}
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

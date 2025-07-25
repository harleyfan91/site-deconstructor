import React from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  LinearProgress,
  Alert,
  Chip,
  Tooltip,
} from '@mui/material';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '../ui/chart';
import { BarChart as RechartsBarChart, Bar, XAxis, YAxis } from 'recharts';
import { useTheme } from '@mui/material/styles';
import { Shield, Smartphone, Zap, Activity, ShieldCheck, Gauge, BarChart } from 'lucide-react';
import type { AnalysisResponse } from '@/types/analysis';
import { useAnalysisContext } from '../../contexts/AnalysisContext';
import { MetricCard } from './shared/MetricCard';

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





function CoreWebVitalsSection({ performance }: { performance: AnalysisResponse["data"]["performance"] }) {
  const theme = useTheme();

  const chartConfig = {
    value: { label: 'Your Site', color: '#FF6B35' },
    benchmark: { label: 'Benchmark', color: theme.palette.grey[300] }
  };
  return (
    <Card sx={{ borderRadius: 2, height: '400px' }}>
      <CardContent sx={{ p: 2, height: '100%' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <BarChart size={24} color="#FF6B35" style={{ marginRight: 8 }} />
          <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold', lineHeight: 1.2 }}>
            Core Web Vitals
          </Typography>
        </Box>
        <Box sx={{ width: '100%', height: '320px' }}>
          <ChartContainer config={chartConfig} style={{ width: '100%', height: '100%' }}>
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
        </Box>
      </CardContent>
    </Card>
  );
}

function SpeedIndexSection({ performanceScore }: { performanceScore: number }) {
  return (
    <Card sx={{ 
      borderRadius: 2, 
      width: '100%', 
      maxWidth: '100%',
      minWidth: 0,
      overflow: 'hidden'
    }}>
      <CardContent sx={{ p: 2, minWidth: 0 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <Gauge size={24} color="#FF6B35" style={{ marginRight: 8 }} />
          <Typography variant="h6" gutterBottom sx={{ 
            fontWeight: 'bold', 
            lineHeight: 1.2,
            minWidth: 0,
            overflow: 'hidden',
            textOverflow: 'ellipsis'
          }}>
            Speed Index
          </Typography>
        </Box>
        <Box sx={{ mb: 2, minWidth: 0 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
            <Typography variant="body2" sx={{ minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis' }}>
              Loading Speed
            </Typography>
            <Tooltip 
              title={getScoreTooltip(performanceScore)}
              enterDelay={300}
              enterTouchDelay={300}
            >
              <Typography variant="body2" sx={{ cursor: 'help', flexShrink: 0 }}>{performanceScore}%</Typography>
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
        <Typography variant="body2" color="text.secondary" sx={{
          minWidth: 0,
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          wordBreak: 'break-word'
        }}>
          Your page loads faster than {performanceScore}% of websites
        </Typography>
      </CardContent>
    </Card>
  );
}

// New Security Audits Section using Lighthouse data
function SecurityAuditsSection() {
  const { data } = useAnalysisContext();

  if (!data?.lhr) {
    return (
      <Card sx={{ borderRadius: 2 }}>
        <CardContent sx={{ p: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <ShieldCheck size={24} color="#FF6B35" style={{ marginRight: 8 }} />
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold', lineHeight: 1.2 }}>
              Security Audits
            </Typography>
          </Box>
          <Typography variant="body2" color="text.secondary">
            Security audit data not available
          </Typography>
        </CardContent>
      </Card>
    );
  }

  const { lhr } = data;

  return (
    <Card sx={{ borderRadius: 2 }}>
      <CardContent sx={{ p: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <ShieldCheck size={24} color="#FF6B35" style={{ marginRight: 8 }} />
          <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold', lineHeight: 1.2 }}>
            Security Audits
          </Typography>
        </Box>
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(3, 1fr)' }, gap: 2 }}>
          {lhr.categories.security.auditRefs.map(ref => {
            const audit = lhr.audits[ref.id];
            const score = Math.round(audit.score * 100);
            return (
              <Tooltip 
                key={ref.id}
                title={audit.description}
                enterDelay={300}
                enterTouchDelay={300}
              >
                <Box
                  sx={{
                    p: 2,
                    border: '1px solid rgba(0,0,0,0.1)',
                    bgcolor: 'background.paper',
                    borderRadius: 1,
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    cursor: 'help'
                  }}
                >
                  <Typography variant="body2" sx={{ fontWeight: 'medium' }}>
                    {audit.title}
                  </Typography>
                  <Chip
                    label={`${score}%`}
                    color={score >= 80 ? 'success' : score >= 60 ? 'warning' : 'error'}
                    size="small"
                    variant="outlined"
                  />
                </Box>
              </Tooltip>
            );
          })}
        </Box>
      </CardContent>
    </Card>
  );
}

function MobileResponsivenessSection() {
  const { data, error } = useAnalysisContext();

  if (error) {
    return (
      <Card sx={{ borderRadius: 2 }}>
        <CardContent sx={{ p: 2 }}>
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
      <CardContent sx={{ p: 2 }}>
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

function SecurityScoreSection() {
  const { data, error } = useAnalysisContext();

  if (error) {
    return (
      <Card sx={{ borderRadius: 2 }}>
        <CardContent sx={{ p: 2 }}>
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
      <CardContent sx={{ p: 2 }}>
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
              backgroundColor: '#9E9E9E',
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
      <CardContent sx={{ p: 2 }}>
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

  // Show content immediately without section loading states

  const { performance } = data.data;
  const mobileScore = contextData?.mobileResponsiveness?.score || 0;
  const securityScore = contextData?.lhr ? Math.round(contextData.lhr.categories.security.score * 100) : 0;

  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
        <Typography variant="h5" gutterBottom sx={{ fontWeight: 'bold', flexGrow: 1 }}>
          Performance & Security Analysis
        </Typography>
      </Box>

      {/* Main content - exactly like SEO tab pattern */}
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '2fr 1fr' }, gap: 2, mb: 2 }}>
        <CoreWebVitalsSection performance={performance} />
        
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
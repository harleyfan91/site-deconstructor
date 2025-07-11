
import React from 'react';
import { Box, Typography, LinearProgress, CircularProgress } from '@mui/material';
import { AlertTriangle, Shield } from 'lucide-react';
import type { AnalysisResponse } from '@/types/analysis';

interface ContrastWarningsCardProps {
  issues: Array<{textColor: string, backgroundColor: string, ratio: number}>;
  data: AnalysisResponse | null;
  loading: boolean;
}

interface ViolationCardProps {
  id: string;
  impact?: string;
  description?: string;
}

const ViolationCard: React.FC<ViolationCardProps> = ({ id, impact, description }) => (
  <Box
    sx={{
      p: 2,
      mb: 1,
      border: '1px solid',
      borderColor: impact === 'critical' ? 'error.main' : impact === 'serious' ? 'warning.main' : 'info.main',
      borderRadius: 1,
      bgcolor: 'background.paper'
    }}
  >
    <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mb: 0.5 }}>
      {id}
    </Typography>
    {description && (
      <Typography variant="body2" color="text.secondary">
        {description}
      </Typography>
    )}
    {impact && (
      <Typography variant="caption" sx={{ 
        color: impact === 'critical' ? 'error.main' : impact === 'serious' ? 'warning.main' : 'info.main',
        fontWeight: 'bold'
      }}>
        Impact: {impact}
      </Typography>
    )}
  </Box>
);

const ContrastWarningsCard: React.FC<ContrastWarningsCardProps> = ({ issues, data, loading }) => {
  // Defensive: always work with an array
  const issuesSafe = Array.isArray(issues) ? issues : [];

  // Extract real accessibility data from color extraction API
  // The accessibility data comes from the color extraction endpoint
  const [accessibilityData, setAccessibilityData] = React.useState<{
    score: number;
    violations: any[];
    contrastIssues: any[];
  } | null>(null);
  const [accessibilityLoading, setAccessibilityLoading] = React.useState(false);

  // Fetch accessibility data when URL is available
  React.useEffect(() => {
    if (data?.url && !loading) {
      fetchAccessibilityData(data.url);
    }
  }, [data?.url, loading]);

  const fetchAccessibilityData = async (url: string) => {
    setAccessibilityLoading(true);
    try {
      const response = await fetch('/api/colors', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url })
      });
      
      if (response.ok) {
        const colorData = await response.json();
        console.log('🛡️ Received accessibility data:', colorData);
        if (colorData.accessibilityScore !== undefined) {
          setAccessibilityData({
            score: colorData.accessibilityScore,
            violations: colorData.violations || [],
            contrastIssues: colorData.contrastIssues || []
          });
          console.log('🎯 Set accessibility data:', { score: colorData.accessibilityScore, violations: colorData.violations?.length, contrastIssues: colorData.contrastIssues?.length });
        } else {
          console.warn('⚠️ No accessibility score in response:', Object.keys(colorData));
        }
      }
    } catch (error) {
      console.warn('Failed to fetch accessibility data:', error);
    } finally {
      setAccessibilityLoading(false);
    }
  };

  // Only use real data - no fallback calculations
  const hasRealAccessibilityData = accessibilityData !== null;
  const score = accessibilityData?.score || 0;
  const violations = accessibilityData?.violations || [];

  if (loading || accessibilityLoading) {
    return (
      <Box>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <Shield size={24} color="#FF6B35" style={{ marginRight: 8 }} />
          <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
            Accessibility & Contrast
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', py: 4 }}>
          <CircularProgress size={24} sx={{ mr: 2 }} />
          <Typography variant="body2">Analyzing accessibility...</Typography>
        </Box>
      </Box>
    );
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
        <Shield size={24} color="#FF6B35" style={{ marginRight: 8 }} />
        <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
          Accessibility & Contrast
        </Typography>
      </Box>

      {/* Accessibility Score */}
      <Box sx={{ mb: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
          <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
            Accessibility Score
          </Typography>
          <Typography variant="h6" sx={{ fontWeight: 'bold', color: hasRealAccessibilityData ? (score >= 80 ? 'success.main' : score >= 60 ? 'warning.main' : 'error.main') : 'text.secondary' }}>
            {hasRealAccessibilityData ? `${score}%` : '!'}
          </Typography>
        </Box>
        {hasRealAccessibilityData ? (
          <LinearProgress
            variant="determinate"
            value={score}
            sx={{
              height: 8,
              borderRadius: 4,
            }}
          />
        ) : (
          <Box sx={{ 
            height: 8, 
            borderRadius: 4, 
            border: '1px dashed',
            borderColor: 'text.secondary',
            opacity: 0.5
          }} />
        )}
      </Box>

      {/* Top Violations */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: 2 }}>
          Top Violations
        </Typography>
        {!hasRealAccessibilityData ? (
          <Typography variant="body2" sx={{ fontStyle: 'italic', color: 'text.secondary' }}>
            Accessibility analysis unavailable !
          </Typography>
        ) : violations.length > 0 ? (
          violations.slice(0, 3).map((violation, index) => (
            <ViolationCard
              key={index}
              id={violation.id}
              impact={violation.impact}
              description={violation.description}
            />
          ))
        ) : (
          <Typography variant="body2" sx={{ fontStyle: 'italic', color: 'text.secondary' }}>
            No accessibility issues detected.
          </Typography>
        )}
      </Box>

      {/* Contrast Issues */}
      <Box>
        <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: 2 }}>
          Color Contrast Issues
        </Typography>
        {!issuesSafe.length ? (
          <Typography variant="body2" sx={{ fontStyle: 'italic', color: 'text.secondary' }}>
            No contrast issues detected.
          </Typography>
        ) : (
          issuesSafe.map((issue, idx) => (
            <Box key={idx} sx={{ mb: 1 }}>
              <Typography variant="body2">
                Text {issue.textColor} on {issue.backgroundColor} – ratio {issue.ratio}
              </Typography>
            </Box>
          ))
        )}
      </Box>
    </Box>
  );
};

export default ContrastWarningsCard;

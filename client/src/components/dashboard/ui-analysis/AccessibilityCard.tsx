import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  LinearProgress, 
  CircularProgress,
  Chip,
  Alert,
  Collapse,
  IconButton
} from '@mui/material';
import { Shield, AlertTriangle, CheckCircle, ChevronDown, ChevronUp } from 'lucide-react';

interface AccessibilityCardProps {
  url?: string;
  contrastIssues?: Array<{
    element: string;
    textColor: string;
    backgroundColor: string;
    ratio: number;
    expectedRatio: number;
    severity: string;
    recommendation: string;
  }>;
  accessibilityScore?: number;
  violations?: Array<{
    id: string;
    impact: 'minor' | 'moderate' | 'serious' | 'critical';
    description: string;
    help: string;
    nodes: Array<{
      target: string[];
      html: string;
      failureSummary?: string;
    }>;
  }>;
  disableAPICall?: boolean;
}

interface AccessibilityData {
  score: number;
  violations: Array<{
    id: string;
    impact: 'minor' | 'moderate' | 'serious' | 'critical';
    description: string;
    help: string;
    nodes: Array<{
      target: string[];
      html: string;
      failureSummary: string;
    }>;
  }>;
  contrastIssues: Array<{
    element: string;
    textColor: string;
    backgroundColor: string;
    ratio: number;
    expectedRatio: number;
    severity: string;
    recommendation: string;
  }>;
  passedRules: number;
  failedRules: number;
}

const AccessibilityCard: React.FC<AccessibilityCardProps> = ({ 
  url, 
  contrastIssues, 
  accessibilityScore, 
  violations, 
  disableAPICall = false 
}) => {
  const [data, setData] = useState<AccessibilityData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    // If we have prop data and API is disabled, use it directly
    if (disableAPICall && (contrastIssues || accessibilityScore || violations)) {
      setData({
        score: accessibilityScore || 0,
        violations: violations || [],
        contrastIssues: contrastIssues || [],
        passedRules: 0,
        failedRules: violations?.length || 0
      });
      setLoading(false);
      return;
    }

    if (!url) {
      setData(null);
      setError(null);
      return;
    }

    const fetchAccessibilityData = async () => {
      setLoading(true);
      setError(null);
      
      try {
        const response = await fetch('/api/colors', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ url })
        });

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`);
        }

        const result = await response.json();
        
        if (result.accessibilityScore !== undefined) {
          setData({
            score: result.accessibilityScore,
            violations: result.violations || [],
            contrastIssues: result.contrastIssues || [],
            passedRules: result.passedRules || 0,
            failedRules: result.failedRules || 0
          });
        } else {
          setError('Accessibility analysis not available');
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch accessibility data');
      } finally {
        setLoading(false);
      }
    };

    fetchAccessibilityData();
  }, [url, contrastIssues, accessibilityScore, violations, disableAPICall]);

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'success.main';
    if (score >= 60) return 'warning.main';
    return 'error.main';
  };

  const getScoreLabel = (score: number) => {
    if (score >= 80) return 'Excellent';
    if (score >= 60) return 'Good';
    return 'Needs Improvement';
  };

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'critical': return 'error';
      case 'serious': return 'warning';
      case 'moderate': return 'info';
      default: return 'default';
    }
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
        <Shield size={24} style={{ marginRight: 8, color: '#FF6B35' }} />
        <Typography variant="h6">
          Accessibility & Contrast
        </Typography>
      </Box>

      {loading && (
        <Box sx={{ display: 'flex', alignItems: 'center', py: 4 }}>
          <CircularProgress size={24} sx={{ mr: 2 }} />
          <Typography variant="body2">Analyzing accessibility...</Typography>
        </Box>
      )}

      {error && (
        <Alert severity="warning" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {data && (
        <Box>
          {/* Accessibility Score */}
          <Box sx={{ mb: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                Accessibility Score
              </Typography>
              <Box sx={{ textAlign: 'right' }}>
                <Typography 
                  variant="h6" 
                  sx={{ 
                    fontWeight: 'bold', 
                    color: getScoreColor(data.score) 
                  }}
                >
                  {data.score}%
                </Typography>
                <Typography 
                  variant="caption" 
                  sx={{ 
                    color: getScoreColor(data.score),
                    fontWeight: 'medium'
                  }}
                >
                  {getScoreLabel(data.score)}
                </Typography>
              </Box>
            </Box>
            <LinearProgress
              variant="determinate"
              value={data.score}
              sx={{
                height: 8,
                borderRadius: 4,
                '& .MuiLinearProgress-bar': {
                  backgroundColor: getScoreColor(data.score)
                }
              }}
            />
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1 }}>
              <Typography variant="caption" color="text.secondary">
                {data.passedRules} rules passed
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {data.failedRules} violations found
              </Typography>
            </Box>
            <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
              Higher scores indicate better accessibility compliance
            </Typography>
          </Box>

          {/* Summary */}
          <Box sx={{ mb: 3 }}>
            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
              <Chip 
                icon={<CheckCircle size={16} />}
                label={`${data.passedRules} Rules Passed`}
                color="success"
                variant="outlined"
                size="small"
              />
              {data.violations.length > 0 && (
                <Chip 
                  icon={<AlertTriangle size={16} />}
                  label={`${data.violations.length} Violations`}
                  color="error"
                  variant="outlined"
                  size="small"
                />
              )}
              {data.contrastIssues.length > 0 && (
                <Chip 
                  label={`${data.contrastIssues.length} Contrast Issues`}
                  color="warning"
                  variant="outlined"
                  size="small"
                />
              )}
            </Box>
          </Box>

          {/* Top Issues */}
          {data.violations.length > 0 && (
            <Box sx={{ mb: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                  Top Issues
                </Typography>
                <IconButton
                  size="small"
                  onClick={() => setExpanded(!expanded)}
                  sx={{ ml: 1 }}
                >
                  {expanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                </IconButton>
              </Box>
              
              {/* Always show first 2 issues */}
              {data.violations.slice(0, 2).map((violation, index) => (
                <Box
                  key={index}
                  sx={{
                    p: 2,
                    mb: 1,
                    border: '1px solid',
                    borderColor: 'divider',
                    borderRadius: 1,
                    bgcolor: 'background.paper'
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mr: 1 }}>
                      {violation.id}
                    </Typography>
                    <Chip
                      label={violation.impact}
                      color={getImpactColor(violation.impact) as any}
                      size="small"
                    />
                  </Box>
                  <Typography variant="body2" color="text.secondary">
                    {violation.description}
                  </Typography>
                </Box>
              ))}

              {/* Expandable section for additional issues */}
              <Collapse in={expanded}>
                {data.violations.slice(2).map((violation, index) => (
                  <Box
                    key={index + 2}
                    sx={{
                      p: 2,
                      mb: 1,
                      border: '1px solid',
                      borderColor: 'divider',
                      borderRadius: 1,
                      bgcolor: 'background.paper'
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mr: 1 }}>
                        {violation.id}
                      </Typography>
                      <Chip
                        label={violation.impact}
                        color={getImpactColor(violation.impact) as any}
                        size="small"
                      />
                    </Box>
                    <Typography variant="body2" color="text.secondary">
                      {violation.description}
                    </Typography>
                  </Box>
                ))}
              </Collapse>
            </Box>
          )}

          {/* No Issues State */}
          {data.violations.length === 0 && data.contrastIssues.length === 0 && (
            <Box sx={{ textAlign: 'center', py: 3 }}>
              <CheckCircle size={48} style={{ color: '#4caf50', marginBottom: 16 }} />
              <Typography variant="h6" color="success.main" sx={{ fontWeight: 'bold' }}>
                No Accessibility Issues Found
              </Typography>
              <Typography variant="body2" color="text.secondary">
                This website follows accessibility best practices
              </Typography>
            </Box>
          )}
        </Box>
      )}

      {!loading && !data && !error && (
        <Box sx={{ textAlign: 'center', py: 4 }}>
          <Typography variant="body2" color="text.secondary">
            Enter a URL to analyze accessibility
          </Typography>
        </Box>
      )}
    </Box>
  );
};

export default AccessibilityCard;
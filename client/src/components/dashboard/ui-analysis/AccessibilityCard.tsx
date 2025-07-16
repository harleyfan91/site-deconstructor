import React from 'react';
import { 
  Box, 
  Typography, 
  LinearProgress, 
  Table, 
  TableBody, 
  TableCell, 
  TableContainer, 
  TableHead, 
  TableRow, 
  Paper, 
  Chip, 
  Button, 
  CircularProgress,
  Alert
} from '@mui/material';
import { Shield, Copy, CheckCircle, XCircle } from 'lucide-react';
import { useAccessibilityScore } from '../../../hooks/useAccessibilityScore';
import { useUIAnalysis } from '../../../hooks/useUIAnalysis';

interface AccessibilityCardProps {
  url?: string;
}

const AccessibilityCard: React.FC<AccessibilityCardProps> = ({ url }) => {
  const { score, contrastIssues, violations, isLoading: scoreLoading, isError: scoreError } = useAccessibilityScore(url || '');
  const { data: uiData, isLoading: uiLoading, error: uiError } = useUIAnalysis(url || '');

  // Extract data from UI analysis response (this includes alt text stats)
  const altStats = uiData?.imageAnalysis?.altStats || { totalImages: 0, withAlt: 0, suspectAlt: 0 };
  
  // Use contrast issues from accessibility analysis
  const axeColorContrast = contrastIssues;
  
  // Calculate WCAG summary from contrast issues
  const wcagSummary = React.useMemo(() => {
    if (axeColorContrast.length === 0) {
      return { ratio: 0, passAA: true, passAAA: true };
    }
    
    const avgRatio = axeColorContrast.reduce((sum: number, issue: any) => sum + (issue.ratio || 0), 0) / axeColorContrast.length;
    const passAA = avgRatio >= 4.5;
    const passAAA = avgRatio >= 7.0;
    
    return { ratio: avgRatio, passAA, passAAA };
  }, [axeColorContrast]);

  // Get score color based on value
  const getScoreColor = (score: number) => {
    if (score >= 90) return '#4CAF50'; // Green
    if (score >= 50) return '#FF9800'; // Amber
    return '#F44336'; // Red
  };

  // Copy to clipboard handler
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text).catch(console.error);
  };

  return (
    <Box>
      {/* Header (keep existing) */}
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
        <Shield size={24} style={{ marginRight: 8, color: '#FF6B35' }} />
        <Typography variant="h6">
          Accessibility & Contrast
        </Typography>
      </Box>

      <Box sx={{ display: 'grid', gap: 2, gridTemplateRows: 'auto' }}>
        {/* 1. Accessibility Score */}
        <Box>
          <Typography variant="body2" sx={{ mb: 1, fontWeight: 500 }}>
            Accessibility Score
          </Typography>
          {scoreLoading ? (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <CircularProgress size={16} />
              <Typography variant="body2" color="text.secondary">Loading...</Typography>
            </Box>
          ) : scoreError ? (
            <Alert severity="error" sx={{ py: 0.5 }}>Error loading score</Alert>
          ) : score !== undefined && score !== null ? (
            <Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                <Typography variant="h6" sx={{ color: getScoreColor(score) }}>
                  {score}
                </Typography>
                <Typography variant="body2" color="text.secondary">/ 100</Typography>
                {score === 0 && (
                  <Typography variant="caption" color="text.secondary" sx={{ fontStyle: 'italic', ml: 1 }}>
                    No Lighthouse accessibility score available
                  </Typography>
                )}
              </Box>
              <LinearProgress
                variant="determinate"
                value={score}
                sx={{
                  height: 8,
                  borderRadius: 1,
                  backgroundColor: '#f5f5f5',
                  '& .MuiLinearProgress-bar': {
                    backgroundColor: getScoreColor(score),
                    borderRadius: 1,
                  },
                }}
              />
            </Box>
          ) : (
            <Typography variant="body2" color="text.secondary">No score available</Typography>
          )}
        </Box>

        {/* 2. Hard-to-read spots table */}
        <Box>
          <Typography variant="body2" sx={{ mb: 1, fontWeight: 500 }}>
            Hard-to-read spots
          </Typography>
          {uiLoading ? (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <CircularProgress size={16} />
              <Typography variant="body2" color="text.secondary">Loading contrast data...</Typography>
            </Box>
          ) : uiError ? (
            <Alert severity="error" sx={{ py: 0.5 }}>Error loading contrast data</Alert>
          ) : axeColorContrast.length > 0 ? (
            <TableContainer component={Paper} sx={{ maxHeight: 200 }}>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Selector</TableCell>
                    <TableCell align="right">Contrast ratio</TableCell>
                    <TableCell align="right">Suggested hex</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {axeColorContrast.slice(0, 5).map((issue: any, index: number) => (
                    <TableRow key={index}>
                      <TableCell sx={{ maxWidth: 150, overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        <Typography variant="body2" component="code" sx={{ fontSize: '0.75rem' }}>
                          {issue.element || issue.selector || 'Unknown'}
                        </Typography>
                      </TableCell>
                      <TableCell align="right">
                        <Typography variant="body2">
                          {issue.ratio ? `${issue.ratio.toFixed(1)}:1` : 'N/A'}
                        </Typography>
                      </TableCell>
                      <TableCell align="right">
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, justifyContent: 'flex-end' }}>
                          <Typography variant="body2" component="code" sx={{ fontSize: '0.75rem' }}>
                            {issue.suggestedColor || issue.suggestion || 'N/A'}
                          </Typography>
                          {issue.suggestedColor && (
                            <Button
                              size="small"
                              onClick={() => copyToClipboard(issue.suggestedColor)}
                              sx={{ minWidth: 'auto', p: 0.25 }}
                            >
                              <Copy size={12} />
                            </Button>
                          )}
                        </Box>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          ) : (
            <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic' }}>
              No contrast issues detected or analysis unavailable due to website security restrictions
            </Typography>
          )}
        </Box>

        {/* 3. Contrast ratio summary badge */}
        <Box>
          <Typography variant="body2" sx={{ mb: 1, fontWeight: 500 }}>
            WCAG Compliance
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Typography variant="body2">
              {wcagSummary.ratio > 0 ? `${wcagSummary.ratio.toFixed(1)}:1` : 'N/A'}
            </Typography>
            <Typography variant="body2">•</Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <Typography variant="body2">AA</Typography>
              {wcagSummary.passAA ? (
                <CheckCircle size={16} color="#4CAF50" />
              ) : (
                <XCircle size={16} color="#F44336" />
              )}
            </Box>
            <Typography variant="body2">/</Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <Typography variant="body2">AAA</Typography>
              {wcagSummary.passAAA ? (
                <CheckCircle size={16} color="#4CAF50" />
              ) : (
                <XCircle size={16} color="#F44336" />
              )}
            </Box>
          </Box>
        </Box>

        {/* 4. Alt-text coverage metric row */}
        <Box>
          <Typography variant="body2" sx={{ mb: 1, fontWeight: 500 }}>
            Alt-text Coverage
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Typography variant="body2">
              {altStats.totalImages > 0 
                ? `${Math.round((altStats.withAlt / altStats.totalImages) * 100)}% with alt`
                : '0% with alt'
              }
            </Typography>
            <Typography variant="body2">•</Typography>
            <Typography variant="body2" color="warning.main">
              {altStats.totalImages > 0 
                ? `${Math.round((altStats.suspectAlt / altStats.totalImages) * 100)}% poor`
                : '0% poor'
              }
            </Typography>
          </Box>
        </Box>

        {/* 5. Missing landmarks section */}
        <Box>
          <Typography variant="body2" sx={{ mb: 1, fontWeight: 500 }}>
            Missing landmarks
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
            {(() => {
              const landmarkViolations = violations?.filter((violation: any) => 
                violation.id === 'landmark-one-main' || 
                violation.id === 'page-has-heading-one' ||
                violation.id === 'region' ||
                violation.id === 'landmark-main-is-top-level' ||
                violation.id === 'landmark-no-duplicate-main' ||
                violation.id === 'landmark-unique' ||
                violation.id === 'html-has-lang' ||
                violation.id === 'valid-lang'
              ) || [];
              
              return landmarkViolations.length > 0 ? (
                landmarkViolations.slice(0, 3).map((violation: any, index: number) => {
                  const landmarkType = violation.id.includes('main') ? '[main]' :
                                     violation.id.includes('lang') ? '[lang]' :
                                     violation.id.includes('heading') ? '[h1]' :
                                     violation.id.includes('region') ? '[nav]' : '[other]';
                  
                  return (
                    <Chip
                      key={index}
                      label={landmarkType}
                      size="small"
                      sx={{
                        backgroundColor: '#fff3cd',
                        color: '#856404',
                        border: '1px solid #ffeaa7',
                        fontSize: '0.75rem',
                        height: 24
                      }}
                    />
                  );
                })
              ) : (
                <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic' }}>
                  No landmark issues detected
                </Typography>
              );
            })()}
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default AccessibilityCard;
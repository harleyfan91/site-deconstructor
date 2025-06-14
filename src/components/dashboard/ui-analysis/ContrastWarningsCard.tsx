
import React from 'react';
import { Box, Typography } from '@mui/material';
import { AlertTriangle } from 'lucide-react';
import type { AnalysisResponse } from '@/types/analysis';

interface ContrastWarningsCardProps {
  issues: AnalysisResponse['data']['ui']['contrastIssues'];
}

const ContrastWarningsCard: React.FC<ContrastWarningsCardProps> = ({ issues }) => {
  // Defensive: always work with an array
  const issuesSafe = Array.isArray(issues) ? issues : [];

  if (!issuesSafe.length) {
    return (
      <Box>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <AlertTriangle size={24} color="#FF6B35" style={{ marginRight: 8 }} />
          <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
            Contrast Warnings
          </Typography>
        </Box>
        <Typography variant="body2">No contrast issues detected.</Typography>
      </Box>
    );
  }
  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
        <AlertTriangle size={24} color="#FF6B35" style={{ marginRight: 8 }} />
        <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
          Contrast Warnings
        </Typography>
      </Box>
      {issuesSafe.map((issue, idx) => (
        <Box key={idx} sx={{ mb: 1 }}>
          <Typography variant="body2">
            Text {issue.textColor} on {issue.backgroundColor} – ratio {issue.ratio}
          </Typography>
        </Box>
      ))}
    </Box>
  );
};

export default ContrastWarningsCard;


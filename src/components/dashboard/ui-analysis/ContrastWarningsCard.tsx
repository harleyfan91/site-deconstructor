import React from 'react';
import { Box, Typography, Card, CardContent } from '@mui/material';
import { AlertTriangle } from 'lucide-react';
import { AnalysisResponse } from '../../../hooks/useAnalysisApi';

interface ContrastWarningsCardProps {
  issues: AnalysisResponse['data']['ui']['contrastIssues'];
}

const ContrastWarningsCard: React.FC<ContrastWarningsCardProps> = ({ issues }) => {
  if (!issues.length) {
    return (
      <Card sx={{ borderRadius: 2 }}>
        <CardContent sx={{ p: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <AlertTriangle size={24} color="#FF6B35" style={{ marginRight: 8 }} />
            <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
              Contrast Warnings
            </Typography>
          </Box>
          <Typography variant="body2">No contrast issues detected.</Typography>
        </CardContent>
      </Card>
    );
  }
  return (
    <Card sx={{ borderRadius: 2 }}>
      <CardContent sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <AlertTriangle size={24} color="#FF6B35" style={{ marginRight: 8 }} />
          <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
            Contrast Warnings
          </Typography>
        </Box>
        {issues.map((issue, idx) => (
          <Box key={idx} sx={{ mb: 1 }}>
            <Typography variant="body2">
              Text {issue.textColor} on {issue.backgroundColor} – ratio {issue.ratio}
            </Typography>
          </Box>
        ))}
      </CardContent>
    </Card>
  );
};

export default ContrastWarningsCard;

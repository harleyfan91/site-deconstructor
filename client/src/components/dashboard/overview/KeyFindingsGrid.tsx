
import React from 'react';
import { Box, Typography, Tooltip } from '@mui/material';
import type { AnalysisResponse } from '@/types/analysis';
import { useScoreColor, getScoreTooltip } from './scoreUtils';

interface KeyFindingsGridProps {
  overview: AnalysisResponse['data']['overview'];
  theme: any;
}

const KeyFindingsGrid: React.FC<KeyFindingsGridProps> = ({ overview, theme }) => {
  const scoreColor = useScoreColor(theme);
  
  if (!overview) {
    return null;
  }
  
  return (
    <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 0.5, mb: 2 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
        <Typography variant="body2">Overall Score</Typography>
        <Tooltip 
          title={getScoreTooltip(overview.overallScore ?? 0, 'overall performance')}
          enterDelay={300}
          enterTouchDelay={300}
        >
          <Typography variant="body2" sx={{ fontWeight: 'bold', color: scoreColor(overview.overallScore ?? 0), cursor: 'help' }}>
            {overview.overallScore ?? 0}/100
          </Typography>
        </Tooltip>
      </Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
        <Typography variant="body2">SEO Score</Typography>
        <Tooltip 
          title={getScoreTooltip(overview.seoScore ?? 0, 'SEO optimization')}
          enterDelay={300}
          enterTouchDelay={300}
        >
          <Typography variant="body2" sx={{ fontWeight: 'bold', color: scoreColor(overview.seoScore ?? 0), cursor: 'help' }}>
            {overview.seoScore ?? 0}/100
          </Typography>
        </Tooltip>
      </Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
        <Typography variant="body2">Page Load Time</Typography>
        <Tooltip 
          title="Time taken for the page to fully load"
          enterDelay={300}
          enterTouchDelay={300}
        >
          <Typography variant="body2" sx={{ fontWeight: 'bold', color: '#FF9800', cursor: 'help' }}>
            {overview.pageLoadTime ?? 'Unknown'}
          </Typography>
        </Tooltip>
      </Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
        <Typography variant="body2">User Experience</Typography>
        <Tooltip 
          title={getScoreTooltip(overview.userExperienceScore ?? 0, 'user experience')}
          enterDelay={300}
          enterTouchDelay={300}
        >
          <Typography
            variant="body2"
            sx={{
              fontWeight: 'bold',
              color: (overview.userExperienceScore ?? 0) >= 80 ? '#4CAF50' : '#2196F3',
              cursor: 'help'
            }}
          >
            {overview.userExperienceScore ?? 0}/100
          </Typography>
        </Tooltip>
      </Box>
    </Box>
  );
};

export default KeyFindingsGrid;

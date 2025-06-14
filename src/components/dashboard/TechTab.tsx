
import React from 'react';
import { Box, Typography, Card, CardContent, Alert, CircularProgress } from '@mui/material';
import type { AnalysisResponse } from '@/types/analysis';
import { dashIfEmpty } from '../../lib/ui';
import ColorLegend from './ColorLegend';

interface TechTabProps {
  data: AnalysisResponse | null;
  loading: boolean;
  error: string | null;
}

const TechTab: React.FC<TechTabProps> = ({ data, loading, error }) => {
  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', py: 8 }}>
        <CircularProgress size={60} />
        <Typography variant="h6" sx={{ ml: 2 }}>Analyzing tech stack...</Typography>
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
        Enter a URL to analyze website tech stack
      </Alert>
    );
  }

  const { techStack, healthGrade, securityScore } = data.data.technical;

  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
        <Typography variant="h5" gutterBottom sx={{ fontWeight: 'bold', mb: 0, mr: 2 }}>
          Tech
        </Typography>
        <ColorLegend />
      </Box>

      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', md: '1fr 1fr 1fr' }, gap: 3 }}>
        <Card sx={{ borderRadius: 2 }}>
          <CardContent sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
              Tech Stack
            </Typography>
            {techStack && techStack.length > 0 ? (
              <ul>
                {techStack.map((tech, i) => (
                  <li key={i}>
                    <strong>{tech.technology}</strong> — <span style={{ color: '#FF6B35' }}>{tech.category}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <Typography variant="body2" color="textSecondary">
                No data available.
              </Typography>
            )}
          </CardContent>
        </Card>

        <Card sx={{ borderRadius: 2 }}>
          <CardContent sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
              Health Grade
            </Typography>
            <Typography variant="body2">{dashIfEmpty(healthGrade)}</Typography>
          </CardContent>
        </Card>

        <Card sx={{ borderRadius: 2 }}>
          <CardContent sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
              Security Score
            </Typography>
            <Typography variant="body2">{dashIfEmpty(securityScore)}</Typography>
          </CardContent>
        </Card>
      </Box>
    </Box>
  );
};
export default TechTab;

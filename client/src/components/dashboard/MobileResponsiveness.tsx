
import React from 'react';
import { Box, Typography, Card, CardContent, LinearProgress, Alert, CircularProgress } from '@mui/material';
import { useAnalysisContext } from '../../contexts/AnalysisContext';

interface IssueCardProps {
  id: string;
  title: string;
  description: string;
}

const IssueCard: React.FC<IssueCardProps> = ({ title, description }) => (
  <Card sx={{ mb: 1, backgroundColor: 'warning.light' }}>
    <CardContent sx={{ py: 1.5 }}>
      <Typography variant="subtitle2" color="warning.dark" gutterBottom>
        {title}
      </Typography>
      <Typography variant="body2" color="text.secondary">
        {description}
      </Typography>
    </CardContent>
  </Card>
);

const MobileResponsiveness = () => {
  const { data, loading, error } = useAnalysisContext();

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" py={4}>
        <CircularProgress />
        <Typography variant="body1" sx={{ ml: 2 }}>
          Analyzing mobile responsiveness...
        </Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ mt: 2 }}>
        Error loading mobile responsiveness data: {error}
      </Alert>
    );
  }

  const { score = 0, issues = [] } = data?.mobileResponsiveness || {};

  return (
    <Box>
      <Typography variant="h5" gutterBottom>
        Mobile Responsiveness
      </Typography>
      
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Box display="flex" alignItems="center" mb={2}>
            <Typography variant="h3" color="primary" sx={{ mr: 2 }}>
              {score}%
            </Typography>
            <Box flexGrow={1}>
              <LinearProgress
                variant="determinate"
                value={score}
                sx={{
                  height: 8,
                  borderRadius: 4,
                  '& .MuiLinearProgress-bar': {
                    borderRadius: 4,
                  },
                }}
              />
            </Box>
          </Box>
          <Typography variant="body2" color="text.secondary">
            Mobile Performance Score
          </Typography>
        </CardContent>
      </Card>

      <Typography variant="h6" gutterBottom>
        Detected Issues
      </Typography>
      
      {issues.length > 0 ? (
        issues.map((issue, idx) => (
          <IssueCard key={idx} {...issue} />
        ))
      ) : (
        <Typography variant="body1" sx={{ fontStyle: 'italic', color: 'text.secondary' }}>
          No mobile issues detected.
        </Typography>
      )}
    </Box>
  );
};

export default MobileResponsiveness;


import React from 'react';
import { Box, Typography, Card, CardContent, Chip, Alert, CircularProgress } from '@mui/material';
import { useAnalysisContext } from '../../contexts/AnalysisContext';

interface GradeBadgeProps {
  grade: string;
}

const GradeBadge: React.FC<GradeBadgeProps> = ({ grade }) => {
  const getGradeColor = (grade: string) => {
    switch (grade) {
      case 'A': return 'success';
      case 'B': return 'info';
      case 'C': return 'warning';
      case 'D': case 'F': return 'error';
      default: return 'default';
    }
  };

  return (
    <Chip 
      label={`Grade: ${grade}`} 
      color={getGradeColor(grade) as any}
      size="medium"
      sx={{ fontSize: '1.2rem', py: 2 }}
    />
  );
};

interface FindingItemProps {
  id: string;
  title: string;
  description: string;
}

const FindingItem: React.FC<FindingItemProps> = ({ title, description }) => (
  <Card sx={{ mb: 1, backgroundColor: 'error.light' }}>
    <CardContent sx={{ py: 1.5 }}>
      <Typography variant="subtitle2" color="error.dark" gutterBottom>
        {title}
      </Typography>
      <Typography variant="body2" color="text.secondary">
        {description}
      </Typography>
    </CardContent>
  </Card>
);

const SecurityScore = () => {
  const { data, loading, error } = useAnalysisContext();

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" py={4}>
        <CircularProgress />
        <Typography variant="body1" sx={{ ml: 2 }}>
          Analyzing security...
        </Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ mt: 2 }}>
        Error loading security data: {error}
      </Alert>
    );
  }

  const { grade = '—', findings = [] } = data?.securityScore || {};

  return (
    <Box>
      <Typography variant="h5" gutterBottom>
        Security Score
      </Typography>
      
      <Card sx={{ mb: 3 }}>
        <CardContent sx={{ textAlign: 'center' }}>
          <GradeBadge grade={grade} />
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            Overall Security Grade
          </Typography>
        </CardContent>
      </Card>

      <Typography variant="h6" gutterBottom>
        Security Findings
      </Typography>
      
      {findings.length > 0 ? (
        findings.map((finding, i) => (
          <FindingItem key={i} {...finding} />
        ))
      ) : (
        <Typography variant="body1" sx={{ fontStyle: 'italic', color: 'text.secondary' }}>
          No security issues detected.
        </Typography>
      )}
    </Box>
  );
};

export default SecurityScore;

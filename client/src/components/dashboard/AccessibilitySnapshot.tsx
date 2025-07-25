
import React from 'react';
import { Box, Typography, Card, CardContent, LinearProgress, Alert } from '@mui/material';
import { useAnalysisContext } from '../../contexts/AnalysisContext';

interface ViolationCardProps {
  id: string;
  impact?: string;
  description?: string;
}

const ViolationCard: React.FC<ViolationCardProps> = ({ id, impact, description }) => (
  <Card sx={{ mb: 1, backgroundColor: 'warning.light' }}>
    <CardContent sx={{ py: 1.5 }}>
      <Box display="flex" alignItems="center" mb={1}>
        <Typography variant="subtitle2" color="warning.dark" sx={{ mr: 1 }}>
          {id}
        </Typography>
        {impact && (
          <Typography variant="caption" color="text.secondary">
            Impact: {impact}
          </Typography>
        )}
      </Box>
      {description && (
        <Typography variant="body2" color="text.secondary">
          {description}
        </Typography>
      )}
    </CardContent>
  </Card>
);

const AccessibilitySnapshot = () => {
  const { data, error } = useAnalysisContext();

  if (error) {
    return (
      <Alert severity="error" sx={{ mt: 2 }}>
        Error loading accessibility data: {error}
      </Alert>
    );
  }

  const violations = data?.accessibility?.violations ?? [];
  const totalChecks = 50; // Approximate number of accessibility checks
  const score = Math.round((1 - violations.length / totalChecks) * 100);

  return (
    <Box>
      <Typography variant="h5" gutterBottom>
        Accessibility Snapshot
      </Typography>
      
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Box display="flex" alignItems="center" mb={2}>
            <Typography variant="h3" color="primary" sx={{ mr: 2 }}>
              {Math.max(0, score)}%
            </Typography>
            <Box flexGrow={1}>
              <LinearProgress 
                variant="determinate" 
                value={Math.max(0, score)} 
                sx={{ height: 8, borderRadius: 4 }}
              />
            </Box>
          </Box>
          <Typography variant="body2" color="text.secondary">
            Accessibility Score ({violations.length} violations found)
          </Typography>
        </CardContent>
      </Card>

      <Typography variant="h6" gutterBottom>
        Top Violations
      </Typography>
      
      {violations.length > 0 ? (
        violations.slice(0, 3).map((violation, i) => (
          <ViolationCard key={i} {...violation} />
        ))
      ) : (
        <Typography variant="body1" sx={{ fontStyle: 'italic', color: 'text.secondary' }}>
          No accessibility issues detected.
        </Typography>
      )}
    </Box>
  );
};

export default AccessibilitySnapshot;

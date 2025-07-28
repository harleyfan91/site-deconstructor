import React from 'react';
import { Box, LinearProgress, Typography, Chip } from '@mui/material';
import { useScanProgress } from '../hooks/useScanProgress';

interface ScanProgressBarProps {
  scanId: string;
  showDetails?: boolean;
}

const getStatusColor = (status: string): 'default' | 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning' => {
  switch (status.toLowerCase()) {
    case 'completed':
    case 'complete':
      return 'success';
    case 'failed':
    case 'error':
      return 'error';
    case 'running':
    case 'in_progress':
      return 'primary';
    case 'queued':
    case 'pending':
      return 'warning';
    default:
      return 'default';
  }
};

const getStatusText = (status: string): string => {
  switch (status.toLowerCase()) {
    case 'queued':
      return 'Queued';
    case 'in_progress':
    case 'running':
      return 'Analyzing';
    case 'completed':
    case 'complete':
      return 'Complete';
    case 'failed':
    case 'error':
      return 'Failed';
    default:
      return status.charAt(0).toUpperCase() + status.slice(1);
  }
};

export function ScanProgressBar({ scanId, showDetails = true }: ScanProgressBarProps) {
  const { progress, status, lastUpdated } = useScanProgress(scanId);

  const progressValue = Math.min(Math.max(progress, 0), 100);
  const statusColor = getStatusColor(status);
  const statusText = getStatusText(status);

  return (
    <Box sx={{ width: '100%', mb: showDetails ? 2 : 1 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
        <Box sx={{ minWidth: 35 }}>
          <Typography variant="body2" color="text.secondary">
            {progressValue.toFixed(0)}%
          </Typography>
        </Box>
        <Box sx={{ width: '100%', mx: 1 }}>
          <LinearProgress 
            variant="determinate" 
            value={progressValue}
            sx={{
              height: 8,
              borderRadius: 4,
              backgroundColor: 'rgba(0, 0, 0, 0.1)',
              '& .MuiLinearProgress-bar': {
                borderRadius: 4,
                backgroundColor: statusColor === 'success' ? '#4caf50' : 
                               statusColor === 'error' ? '#f44336' :
                               statusColor === 'primary' ? '#2196f3' : '#ff9800'
              }
            }}
          />
        </Box>
        <Box sx={{ minWidth: 80 }}>
          <Chip 
            label={statusText}
            color={statusColor}
            size="small"
            variant="outlined"
          />
        </Box>
      </Box>
      
      {showDetails && lastUpdated && (
        <Typography variant="caption" color="text.secondary">
          Last updated: {new Date(lastUpdated).toLocaleTimeString()}
        </Typography>
      )}
    </Box>
  );
}

export default ScanProgressBar;
import { Card, CardContent, CardHeader, Typography, Box, Chip, CircularProgress } from '@mui/material';
import { TaskData } from '../hooks/useTaskData';
import { SkeletonCard } from './SkeletonCard';

interface TaskCardProps {
  type: string;
  data?: TaskData;
  isLoading: boolean;
  error?: Error | null;
}

export function TaskCard({ type, data, isLoading, error }: TaskCardProps) {
  if (isLoading || !data) {
    return <SkeletonCard title={type} />;
  }

  if (error) {
    return (
      <Card sx={{ height: '100%', minHeight: 200 }}>
        <CardHeader
          title={type.toUpperCase()}
          sx={{
            backgroundColor: 'error.dark',
            '& .MuiCardHeader-title': {
              fontSize: '0.875rem',
              fontWeight: 600,
              letterSpacing: '0.1em',
              color: 'error.contrastText',
            },
          }}
        />
        <CardContent>
          <Typography color="error" variant="body2">
            Failed to load {type} data: {error.message}
          </Typography>
        </CardContent>
      </Card>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'complete': return 'success';
      case 'running': return 'warning';
      case 'failed': return 'error';
      default: return 'default';
    }
  };

  const getStatusIcon = (status: string) => {
    if (status === 'running') {
      return <CircularProgress size={16} sx={{ ml: 1 }} />;
    }
    return null;
  };

  return (
    <Card sx={{ height: '100%', minHeight: 200 }}>
      <CardHeader
        title={
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Typography
              sx={{
                fontSize: '0.875rem',
                fontWeight: 600,
                letterSpacing: '0.1em',
              }}
            >
              {type.toUpperCase()}
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Chip
                label={data.status}
                color={getStatusColor(data.status) as any}
                size="small"
                variant="outlined"
              />
              {getStatusIcon(data.status)}
            </Box>
          </Box>
        }
        sx={{
          backgroundColor: 'action.hover',
        }}
      />
      <CardContent>
        {data.status === 'complete' && data.data ? (
          <Box>
            <Typography variant="caption" color="text.secondary" gutterBottom>
              Analysis Results:
            </Typography>
            <Box
              component="pre"
              sx={{
                fontSize: '0.75rem',
                overflow: 'auto',
                maxHeight: 150,
                backgroundColor: 'grey.100',
                p: 1,
                borderRadius: 1,
                whiteSpace: 'pre-wrap',
                fontFamily: 'monospace',
              }}
            >
              {JSON.stringify(data.data, null, 2)}
            </Box>
          </Box>
        ) : data.status === 'failed' ? (
          <Typography color="error" variant="body2">
            {data.error || 'Analysis failed'}
          </Typography>
        ) : (
          <Typography variant="body2" color="text.secondary">
            {data.status === 'running' ? 'Analysis in progress...' : 'Waiting to start...'}
          </Typography>
        )}
        {data.completedAt && (
          <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
            Completed: {new Date(data.completedAt).toLocaleTimeString()}
          </Typography>
        )}
      </CardContent>
    </Card>
  );
}
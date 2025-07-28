import React from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Alert,
  CircularProgress,
} from '@mui/material';
import type { AnalysisResponse } from '@/types/analysis';
import { useTheme } from '@mui/material/styles';
import UrlDisplayBox from './overview/UrlDisplayBox';
import MetricCards from './overview/MetricCards';
import MetricInfoPopover from './overview/MetricInfoPopover';
import KeyFindingsGrid from './overview/KeyFindingsGrid';
import { getMetricDefinitions } from './overview/metricDefinitions';

interface OverviewTabProps {
  data: AnalysisResponse | null;
  loading: boolean;
  error: string | null;
}

const OverviewTab: React.FC<OverviewTabProps> = ({ data, loading, error }) => {
  const theme = useTheme();
  // Popover control state (for metric info)
  const [infoAnchor, setInfoAnchor] = React.useState<HTMLElement | null>(null);
  const [infoText, setInfoText] = React.useState<string | null>(null);

  // Show error state
  if (error) {
    return (
      <Alert severity="error" sx={{ mt: 2 }}>
        {error}
      </Alert>
    );
  }

  // Show "idle" state only when there's no data AND no loading in progress
  if (!data && !loading) {
    return (
      <Alert severity="info" sx={{ mt: 2 }}>
        Enter a URL to analyze a website
      </Alert>
    );
  }

  // Show loading indicator only when no data at all
  if (loading && !data) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', py: 8 }}>
        <CircularProgress size={60} />
        <Typography variant="h6" sx={{ ml: 2 }}>
          Analyzing website...
        </Typography>
      </Box>
    );
  }

  const overview = data?.data?.overview || { overallScore: 0 };
  if (!overview.overallScore && overview.overallScore !== 0) return null;

  // REPLACED PLACEHOLDER: now pulls real data from overview.pageLoadTime and overview.coreWebVitals
  const metrics = getMetricDefinitions(overview, theme);

  // Handler for launching metric info popover
  const handleMetricInfo = (event: React.MouseEvent<HTMLElement>, info: string) => {
    setInfoAnchor(event.currentTarget);
    setInfoText(info);
  };

  // Handler to close popover
  const handleClosePopover = () => {
    setInfoAnchor(null);
    setInfoText(null);
  };

  return (
    <Box>
      {/* Header with title and styled URL background */}
      <Box 
        sx={{ 
          position: 'relative',
          mb: 3,
          mx: -3, // Extend beyond card padding
          px: 3, // Add padding back for content
          // Slightly reduced padding to make the gradient header shorter
          py: 1.5,
        }}
      >
        {/* Orange gradient background - stops before edge, larger transparent section */}
        <Box
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: '20px', // Stop before the edge
            bottom: 0,
            background: `linear-gradient(to left, ${theme.palette.primary.main} 0%, ${theme.palette.primary.main} 12%, transparent 60%)`,
            borderRadius: '8px'
          }}
        />
        {/* Content */}
        <Box 
          sx={{ 
            position: 'relative',
            zIndex: 1,
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center', 
            gap: 2 
          }}
        >
          <Typography variant="h5" sx={{ 
            color: 'white', 
            textShadow: '0 1px 2px rgba(0,0,0,0.3)'
          }}>
            Website Overview
          </Typography>
          <UrlDisplayBox url={data?.url ?? ''} />
        </Box>
      </Box>

      {/* Styled divider matching Font Analysis and SEO Checklist */}
      <Box
        sx={{
          borderBottom: '1px solid #E0E0E0',
          mb: 3,
        }}
      />

      {/* Metric card grid */}
      <MetricCards metrics={metrics} onInfo={handleMetricInfo} />

      {/* Popover for metric info (shows only when infoAnchor is set) */}
      <MetricInfoPopover anchorEl={infoAnchor} infoText={infoText} onClose={handleClosePopover} />

      {/* Analysis Summary */}
      <Box sx={{ mt: 4 }}>
        <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
          Analysis Summary
        </Typography>
        <Card sx={{ borderRadius: 2 }}>
          <CardContent sx={{ p: 3 }}>
            <Typography variant="body1" paragraph>
              Analysis completed at {data?.timestamp ? new Date(data.timestamp).toLocaleString() : 'Unknown time'}.
              {(overview?.overallScore ?? 0) >= 80
                ? ' The page shows excellent performance across most metrics.'
                : ' The page has room for improvement in several areas.'}
            </Typography>
          </CardContent>
        </Card>
      </Box>

      {/* Key Findings */}
      <Box sx={{ mt: 3 }}>
        <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
          Key Findings
        </Typography>
        <Card sx={{ borderRadius: 2 }}>
          <CardContent sx={{ p: 3 }}>
            <KeyFindingsGrid overview={overview.overallScore ? overview : { overallScore: 0 }} theme={theme} />
          </CardContent>
        </Card>
      </Box>
    </Box>
  );
};

export default OverviewTab;
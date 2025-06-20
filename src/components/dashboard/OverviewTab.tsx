
import React from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  CircularProgress,
  Alert,
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

  // Show loading indicator while data is being fetched
  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', py: 8 }}>
        <CircularProgress size={60} />
        <Typography variant="h6" sx={{ ml: 2 }}>
          Analyzing website...
        </Typography>
      </Box>
    );
  }

  // Show error state
  if (error) {
    return (
      <Alert severity="error" sx={{ mt: 2 }}>
        {error}
      </Alert>
    );
  }

  // Show "idle" state before analysis starts
  if (!data) {
    return (
      <Alert severity="info" sx={{ mt: 2 }}>
        Enter a URL to analyze a website
      </Alert>
    );
  }

  const metrics = getMetricDefinitions(data.data.overview, theme);

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
      {/* Header with title and styled URL box */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, gap: 2 }}>
        <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
          Website Overview
        </Typography>
        <UrlDisplayBox url={data.url} />
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

      <Box sx={{ mt: 4 }}>
        <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
          Analysis Summary
        </Typography>
        <Card sx={{ borderRadius: 2 }}>
          <CardContent sx={{ p: 3 }}>
            <Typography variant="body1" paragraph>
              Analysis completed at {new Date(data.timestamp).toLocaleString()}.
              {data.data.overview.overallScore >= 80
                ? ' The page shows excellent performance across most metrics.'
                : ' The page has room for improvement in several areas.'}
            </Typography>
            <Typography variant="body1" paragraph>
              <strong>Key Findings:</strong>
            </Typography>
            <KeyFindingsGrid overview={data.data.overview} theme={theme} />
          </CardContent>
        </Card>
      </Box>
    </Box>
  );
};

export default OverviewTab;

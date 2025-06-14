
import React from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  CircularProgress,
  Alert,
  Link,
  IconButton,
  Popover,
} from '@mui/material';
import { TrendingUp, Users, Clock, Star } from 'lucide-react';
import InfoOutlined from '@mui/icons-material/InfoOutlined';
import type { AnalysisResponse } from '@/types/analysis';

// Helper: Returns descriptive color for a given score
const getScoreColor = (score: number) => {
  if (score >= 80) return '#4CAF50';
  if (score >= 60) return '#FF9800';
  return '#F44336';
};

// Helper: Returns performance/SEO descriptions
const getScoreDescription = (score: number, excellentMsg: string, goodMsg: string, badMsg: string) => {
  if (score >= 80) return excellentMsg;
  if (score >= 60) return goodMsg;
  return badMsg;
};

// Extract metrics for easier mapping to cards
const getMetricDefinitions = (overview: AnalysisResponse['data']['overview']) => [
  {
    title: 'Overall Score',
    value: `${overview.overallScore}/100`,
    icon: Star,
    color: getScoreColor(overview.overallScore),
    description: getScoreDescription(
      overview.overallScore,
      'Excellent performance overall',
      'Good, could be improved',
      'Needs improvement',
    ),
    info:
      'Overall score weights performance (40%), SEO (40%) and user experience (20%) based on the collected metrics.',
  },
  {
    title: 'Page Load Time',
    value: overview.pageLoadTime,
    icon: Clock,
    color: '#FF9800',
    description: 'Page loading performance',
  },
  {
    title: 'SEO Score',
    value: `${overview.seoScore}/100`,
    icon: TrendingUp,
    color: getScoreColor(overview.seoScore),
    description: overview.seoScore >= 80 ? 'Excellent SEO optimization' : 'SEO could be improved',
  },
  {
    title: 'User Experience',
    value: `${overview.userExperienceScore}/100`,
    icon: Users,
    color: overview.userExperienceScore >= 80 ? '#4CAF50' : '#2196F3',
    description: overview.userExperienceScore >= 80 ? 'Excellent user experience' : 'Good user experience',
  },
];

// Memoized metric card list for performance
function MetricCards({
  metrics,
  onInfo,
}: {
  metrics: ReturnType<typeof getMetricDefinitions>;
  onInfo: (event: React.MouseEvent<HTMLElement>, info: string) => void;
}) {
  return (
    <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 2, alignItems: 'stretch' }}>
      {metrics.map((metric, index) => {
        const IconComponent = metric.icon;
        return (
          <Card key={index} sx={{ height: '100%', borderRadius: 2 }}>
            <CardContent sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Box
                  sx={{
                    p: 1,
                    borderRadius: 1,
                    backgroundColor: `${metric.color}20`,
                    color: metric.color,
                    mr: 2,
                  }}
                >
                  <IconComponent size={24} />
                </Box>
                <Typography variant="h6" component="div" sx={{ fontWeight: 'bold' }}>
                  {metric.value}
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 'medium' }}>
                  {metric.title}
                </Typography>
                {metric.info && (
                  <IconButton size="small" onClick={e => onInfo(e, metric.info!)}>
                    <InfoOutlined fontSize="small" />
                  </IconButton>
                )}
              </Box>
              <Typography variant="body2" color="text.secondary">
                {metric.description}
              </Typography>
            </CardContent>
          </Card>
        );
      })}
    </Box>
  );
}

// Render the info popover for the metrics
const MetricInfoPopover: React.FC<{
  anchorEl: HTMLElement | null;
  infoText: string | null;
  onClose: () => void;
}> = ({ anchorEl, infoText, onClose }) => (
  <Popover
    open={Boolean(anchorEl)}
    anchorEl={anchorEl}
    onClose={onClose}
    anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
    transformOrigin={{ vertical: 'top', horizontal: 'center' }}
  >
    <Box sx={{ p: 2, maxWidth: 250 }}>
      <Typography variant="body2">{infoText}</Typography>
    </Box>
  </Popover>
);

// Key findings table for summary section
const KeyFindingsGrid: React.FC<{ overview: AnalysisResponse['data']['overview'] }> = ({ overview }) => (
  <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 1, mb: 2 }}>
    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
      <Typography variant="body2">Overall Score</Typography>
      <Typography variant="body2" sx={{ fontWeight: 'bold', color: getScoreColor(overview.overallScore) }}>
        {overview.overallScore}/100
      </Typography>
    </Box>
    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
      <Typography variant="body2">SEO Score</Typography>
      <Typography variant="body2" sx={{ fontWeight: 'bold', color: getScoreColor(overview.seoScore) }}>
        {overview.seoScore}/100
      </Typography>
    </Box>
    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
      <Typography variant="body2">Page Load Time</Typography>
      <Typography variant="body2" sx={{ fontWeight: 'bold', color: '#FF9800' }}>
        {overview.pageLoadTime}
      </Typography>
    </Box>
    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
      <Typography variant="body2">User Experience</Typography>
      <Typography
        variant="body2"
        sx={{
          fontWeight: 'bold',
          color: overview.userExperienceScore >= 80 ? '#4CAF50' : '#2196F3',
        }}
      >
        {overview.userExperienceScore}/100
      </Typography>
    </Box>
  </Box>
);

// ---------- Main Component ----------

interface OverviewTabProps {
  data: AnalysisResponse | null;
  loading: boolean;
  error: string | null;
}

/**
 * Website OverviewTab
 * Shows high-level analysis, score, metrics, and summary for the analyzed URL.
 *
 * UI/UX matches previous version exactly—purely a structure/clarity refactor.
 */
const OverviewTab: React.FC<OverviewTabProps> = ({ data, loading, error }) => {
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

  const metrics = getMetricDefinitions(data.data.overview);

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
      {/* Header with title and URL */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
          Website Overview
        </Typography>
        <Link
          href={data.url}
          target="_blank"
          rel="noopener noreferrer"
          underline="hover"
          color="#FF6B35"
          variant="h6"
          sx={{
            wordBreak: 'break-all',
            fontWeight: 400, // Not bold
            lineHeight: 1.3,
          }}
        >
          {data.url}
        </Link>
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
            {/* Summary key findings table */}
            <KeyFindingsGrid overview={data.data.overview} />
          </CardContent>
        </Card>
      </Box>
    </Box>
  );
};

export default OverviewTab;


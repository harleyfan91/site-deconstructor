
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
  Tooltip,
} from '@mui/material';
import { TrendingUp, Users, Clock, Star } from 'lucide-react';
import InfoOutlined from '@mui/icons-material/InfoOutlined';
import type { AnalysisResponse } from '@/types/analysis';
import { useTheme } from '@mui/material/styles';

// Helper: Returns descriptive color for a given score using theme palette
const useScoreColor = (theme: any) => (score: number) => {
  if (score >= 80) return theme.palette.success.main;
  if (score >= 60) return theme.palette.warning.main;
  return theme.palette.error.main;
};

// Helper: Returns performance/SEO descriptions
const getScoreDescription = (score: number, excellentMsg: string, goodMsg: string, badMsg: string) => {
  if (score >= 80) return excellentMsg;
  if (score >= 60) return goodMsg;
  return badMsg;
};

// Helper: Get score tooltip text
const getScoreTooltip = (score: number, type: string) => {
  const level = score >= 80 ? 'Excellent' : score >= 60 ? 'Good' : 'Poor';
  const range = score >= 80 ? '(80+)' : score >= 60 ? '(60-79)' : '(<60)';
  return `${level} ${type} ${range}`;
};

// Extract metrics for easier mapping to cards
const getMetricDefinitions = (overview: AnalysisResponse['data']['overview'], theme: any) => [
  {
    titleLines: ['Overall', 'Score'],
    value: `${overview.overallScore}/100`,
    icon: Star,
    color: useScoreColor(theme)(overview.overallScore),
    description: getScoreDescription(
      overview.overallScore,
      'Excellent performance overall',
      'Good, could be improved',
      'Needs improvement',
    ),
    info:
      'Overall score weights performance (40%), SEO (40%) and user experience (20%) based on the collected metrics.',
    tooltip: getScoreTooltip(overview.overallScore, 'overall performance'),
  },
  {
    titleLines: ['Page Load', 'Time'],
    value: overview.pageLoadTime,
    icon: Clock,
    color: theme.palette.warning.main,
    description: 'Page loading performance',
    tooltip: 'Time taken for the page to fully load',
  },
  {
    titleLines: ['SEO', 'Score'],
    value: `${overview.seoScore}/100`,
    icon: TrendingUp,
    color: useScoreColor(theme)(overview.seoScore),
    description: overview.seoScore >= 80 ? 'Excellent SEO optimization' : 'SEO could be improved',
    tooltip: getScoreTooltip(overview.seoScore, 'SEO optimization'),
  },
  {
    titleLines: ['User', 'Experience'],
    value: `${overview.userExperienceScore}/100`,
    icon: Users,
    color: overview.userExperienceScore >= 80 ? theme.palette.success.main : theme.palette.primary.main,
    description: overview.userExperienceScore >= 80 ? 'Excellent user experience' : 'Good user experience',
    tooltip: getScoreTooltip(overview.userExperienceScore, 'user experience'),
  },
];

// --- Updated MetricCards: Always reserve Info icon space, fixing title alignment ---
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
              {/* Card Title FIRST, now forced to 2 rows */}
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  mb: 1,
                  minHeight: 52, // Ensure same height for all cards
                }}
              >
                <Typography
                  variant="h6"
                  sx={{
                    fontWeight: 'bold',
                    color: '#fff',
                    mb: 0,
                    lineHeight: 1.15,
                    wordBreak: 'break-word',
                  }}
                  data-testid="card-title"
                >
                  {metric.titleLines[0]}<br />{metric.titleLines[1]}
                </Typography>
                {/* Always render a placeholder IconButton for alignment (real or invisible) */}
                {metric.info ? (
                  <IconButton size="small" aria-label="info" onClick={e => onInfo(e, metric.info!)}>
                    <InfoOutlined fontSize="small" />
                  </IconButton>
                ) : (
                  // Invisible IconButton to reserve space
                  <IconButton size="small" sx={{ visibility: 'hidden' }}>
                    <InfoOutlined fontSize="small" />
                  </IconButton>
                )}
              </Box>
              {/* Icon and Value */}
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
                <Tooltip 
                  title={metric.tooltip}
                  enterDelay={300}
                  enterTouchDelay={300}
                >
                  <Typography variant="h6" component="div" sx={{ fontWeight: 'bold', cursor: 'help' }}>
                    {metric.value}
                  </Typography>
                </Tooltip>
              </Box>
              {/* Description */}
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

// --- KeyFindingsGrid updated for useScoreColor ---
const KeyFindingsGrid: React.FC<{ overview: AnalysisResponse['data']['overview'], theme: any }> = ({ overview, theme }) => {
  const scoreColor = useScoreColor(theme);
  return (
    <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 1, mb: 2 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
        <Typography variant="body2">Overall Score</Typography>
        <Tooltip 
          title={getScoreTooltip(overview.overallScore, 'overall performance')}
          enterDelay={300}
          enterTouchDelay={300}
        >
          <Typography variant="body2" sx={{ fontWeight: 'bold', color: scoreColor(overview.overallScore), cursor: 'help' }}>
            {overview.overallScore}/100
          </Typography>
        </Tooltip>
      </Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
        <Typography variant="body2">SEO Score</Typography>
        <Tooltip 
          title={getScoreTooltip(overview.seoScore, 'SEO optimization')}
          enterDelay={300}
          enterTouchDelay={300}
        >
          <Typography variant="body2" sx={{ fontWeight: 'bold', color: scoreColor(overview.seoScore), cursor: 'help' }}>
            {overview.seoScore}/100
          </Typography>
        </Tooltip>
      </Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
        <Typography variant="body2">Page Load Time</Typography>
        <Tooltip 
          title="Time taken for the page to fully load"
          enterDelay={300}
          enterTouchDelay={300}
        >
          <Typography variant="body2" sx={{ fontWeight: 'bold', color: '#FF9800', cursor: 'help' }}>
            {overview.pageLoadTime}
          </Typography>
        </Tooltip>
      </Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
        <Typography variant="body2">User Experience</Typography>
        <Tooltip 
          title={getScoreTooltip(overview.userExperienceScore, 'user experience')}
          enterDelay={300}
          enterTouchDelay={300}
        >
          <Typography
            variant="body2"
            sx={{
              fontWeight: 'bold',
              color: overview.userExperienceScore >= 80 ? '#4CAF50' : '#2196F3',
              cursor: 'help'
            }}
          >
            {overview.userExperienceScore}/100
          </Typography>
        </Tooltip>
      </Box>
    </Box>
  );
};

// ---------- Main Component ----------

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
  const scoreColor = useScoreColor(theme);

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
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            bgcolor: 'background.paper',
            border: '1px solid rgba(0,0,0,0.1)',
            borderRadius: 1,
            px: 2,
            py: 1,
            maxWidth: { xs: '50%', sm: '40%', md: '30%' },
            minWidth: 0,
          }}
        >
          <Typography
            variant="caption"
            sx={{
              fontSize: { xs: '0.8rem', sm: '0.85rem' },
              color: 'text.secondary',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
              cursor: 'pointer',
            }}
            component={Link}
            href={data.url}
            target="_blank"
            rel="noopener noreferrer"
            underline="hover"
          >
            {data.url}
          </Typography>
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
            {/* Updated: KeyFindingsGrid now uses useScoreColor properly */}
            <KeyFindingsGrid overview={data.data.overview} theme={theme} />
          </CardContent>
        </Card>
      </Box>
    </Box>
  );
};

export default OverviewTab;

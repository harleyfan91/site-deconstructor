
import React from 'react';
import { Box, Typography, Card, CardContent, CircularProgress, Alert, Link, IconButton, Popover } from '@mui/material';
import Grid from '@mui/material/Grid2';
import { TrendingUp, Users, Clock, Star } from 'lucide-react';
import InfoOutlined from '@mui/icons-material/InfoOutlined';
import type { AnalysisResponse } from '@/types/analysis';

interface OverviewTabProps {
  data: AnalysisResponse | null;
  loading: boolean;
  error: string | null;
}

const OverviewTab: React.FC<OverviewTabProps> = ({ data, loading, error }) => {
  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', py: 8 }}>
        <CircularProgress size={60} />
        <Typography variant="h6" sx={{ ml: 2 }}>Analyzing website...</Typography>
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
        Enter a URL to analyze a website
      </Alert>
    );
  }

  const [infoAnchor, setInfoAnchor] = React.useState<HTMLElement | null>(null);

  const metrics = [
    {
      title: 'Overall Score',
      value: `${data.data.overview.overallScore}/100`,
      icon: Star,
      color: data.data.overview.overallScore >= 80 ? '#4CAF50' : data.data.overview.overallScore >= 60 ? '#FF9800' : '#F44336',
      description: data.data.overview.overallScore >= 80 ? 'Excellent performance overall' : data.data.overview.overallScore >= 60 ? 'Good, could be improved' : 'Needs improvement',
      info: 'Overall score weights performance (40%), SEO (40%) and user experience (20%) based on the collected metrics.'
    },
    {
      title: 'Page Load Time',
      value: data.data.overview.pageLoadTime,
      icon: Clock,
      color: '#FF9800',
      description: 'Page loading performance'
    },
    {
      title: 'SEO Score',
      value: `${data.data.overview.seoScore}/100`,
      icon: TrendingUp,
      color: data.data.overview.seoScore >= 80 ? '#4CAF50' : data.data.overview.seoScore >= 60 ? '#FF9800' : '#F44336',
      description: data.data.overview.seoScore >= 80 ? 'Excellent SEO optimization' : 'SEO could be improved'
    },
    {
      title: 'User Experience',
      value: `${data.data.overview.userExperienceScore}/100`,
      icon: Users,
      color: data.data.overview.userExperienceScore >= 80 ? '#4CAF50' : '#2196F3',
      description: data.data.overview.userExperienceScore >= 80 ? 'Excellent user experience' : 'Good user experience'
    }
  ];

  return (
    <Box>
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
          variant="h5"
          sx={{ fontWeight: 'bold', wordBreak: 'break-all' }}
        >
          {data.url}
        </Link>
      </Box>
      
      <Grid container spacing={2} alignItems="stretch">
        {metrics.map((metric, index) => {
          const IconComponent = metric.icon;
          return (
            <Grid xs={6} key={index} sx={{ display: 'flex' }}>
              <Card sx={{ height: '100%', borderRadius: 2, flexGrow: 1 }}>
                <CardContent sx={{ p: 3 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <Box
                      sx={{
                        p: 1,
                        borderRadius: 1,
                        backgroundColor: `${metric.color}20`,
                        color: metric.color,
                        mr: 2
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
                      <IconButton size="small" onClick={(e) => setInfoAnchor(e.currentTarget)}>
                        <InfoOutlined fontSize="small" />
                      </IconButton>
                    )}
                  </Box>
                  <Typography variant="body2" color="text.secondary">
                    {metric.description}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          );
        })}
      </Grid>

      <Popover
        open={Boolean(infoAnchor)}
        anchorEl={infoAnchor}
        onClose={() => setInfoAnchor(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        transformOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Box sx={{ p: 2, maxWidth: 250 }}>
          <Typography variant="body2">
            {metrics.find(m => m.info)?.info}
          </Typography>
        </Box>
      </Popover>

      <Box sx={{ mt: 4 }}>
        <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
          Analysis Summary
        </Typography>
        <Card sx={{ borderRadius: 2 }}>
          <CardContent sx={{ p: 3 }}>
            <Typography variant="body1" paragraph>
              Analysis completed at {new Date(data.timestamp).toLocaleString()}. 
              {data.data.overview.overallScore >= 80 ? 
                ' The page shows excellent performance across most metrics.' :
                ' The page has room for improvement in several areas.'
              }
            </Typography>
          <Typography variant="body1" paragraph>
            <strong>Key Findings:</strong>
          </Typography>
          <Grid container spacing={1} sx={{ mb: 2 }}>
            <Grid xs={6}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
              <Typography variant="body2">Overall Score</Typography>
              <Typography
                variant="body2"
                sx={{
                  fontWeight: 'bold',
                  color:
                    data.data.overview.overallScore >= 80
                      ? '#4CAF50'
                      : data.data.overview.overallScore >= 60
                      ? '#FF9800'
                      : '#F44336'
                }}
              >
                {data.data.overview.overallScore}/100
              </Typography>
              </Box>
            </Grid>
            <Grid xs={6}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
              <Typography variant="body2">SEO Score</Typography>
              <Typography
                variant="body2"
                sx={{
                  fontWeight: 'bold',
                  color:
                    data.data.overview.seoScore >= 80
                      ? '#4CAF50'
                      : data.data.overview.seoScore >= 60
                      ? '#FF9800'
                      : '#F44336'
                }}
              >
                {data.data.overview.seoScore}/100
              </Typography>
              </Box>
            </Grid>
            <Grid xs={6}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
              <Typography variant="body2">Page Load Time</Typography>
              <Typography variant="body2" sx={{ fontWeight: 'bold', color: '#FF9800' }}>
                {data.data.overview.pageLoadTime}
              </Typography>
              </Box>
            </Grid>
            <Grid xs={6}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
              <Typography variant="body2">User Experience</Typography>
              <Typography
                variant="body2"
                sx={{
                  fontWeight: 'bold',
                  color:
                    data.data.overview.userExperienceScore >= 80 ? '#4CAF50' : '#2196F3'
                }}
              >
                {data.data.overview.userExperienceScore}/100
              </Typography>
              </Box>
            </Grid>
          </Grid>
          </CardContent>
        </Card>
      </Box>
    </Box>
  );
};

export default OverviewTab;

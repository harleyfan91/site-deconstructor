
import React from 'react';
import { Box, Typography, Grid, Card, CardContent, LinearProgress, CircularProgress, Alert } from '@mui/material';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '../ui/chart';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis } from 'recharts';
import { useTheme } from '@mui/material/styles';
import type { AnalysisResponse } from '../../hooks/useAnalysisApi';

interface ContentAnalysisTabProps {
  data: AnalysisResponse | null;
  loading: boolean;
  error: string | null;
}

const ContentAnalysisTab = ({ data, loading, error }: ContentAnalysisTabProps) => {
  const theme = useTheme();

  // Loading state
  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 400 }}>
        <CircularProgress />
        <Typography variant="h6" sx={{ ml: 2 }}>
          Analyzing content...
        </Typography>
      </Box>
    );
  }

  // Error state
  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error" sx={{ mb: 2 }}>
          Error loading content analysis: {error}
        </Alert>
      </Box>
    );
  }

  // No data state
  if (!data) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="info">
          No content analysis data available. Please analyze a website first.
        </Alert>
      </Box>
    );
  }

  // Extract content-specific data from API response
  const imageData = data.data?.ui?.imageAnalysis;
  const totalImages = imageData?.totalImages || 0;
  const estimatedPhotos = imageData?.estimatedPhotos || 0;
  const estimatedIcons = imageData?.estimatedIcons || 0;

  // Create content distribution data (focusing on content types)
  const contentTypes = [
    { name: 'Photos', value: estimatedPhotos, color: theme.palette.primary.main },
    { name: 'Icons', value: estimatedIcons, color: theme.palette.success.main },
    { name: 'Other Images', value: Math.max(0, totalImages - estimatedPhotos - estimatedIcons), color: theme.palette.warning.main },
  ].filter(item => item.value > 0);

  // Content readability and text analysis data
  const readabilityScore = data.readabilityScore || 0;
  const seoChecks = data.data?.seo?.checks || [];
  const metaTags = data.data?.seo?.metaTags || {};

  // Content structure analysis
  const contentStructureData = [
    { metric: 'Readability Score', score: readabilityScore, benchmark: 60 },
    { metric: 'Meta Description', score: metaTags.description ? 100 : 0, benchmark: 100 },
    { metric: 'Title Tag', score: metaTags.title ? 100 : 0, benchmark: 100 },
    { metric: 'Alt Text Coverage', score: totalImages > 0 ? Math.min(100, (estimatedPhotos / totalImages) * 100) : 0, benchmark: 80 },
  ];

  // Text accessibility metrics
  const textAccessibilityScore = seoChecks.filter(check => check.status === 'good').length / Math.max(seoChecks.length, 1) * 100;

  // Use theme for chart config
  const chartConfig = {
    score: { label: 'Score', color: theme.palette.primary.main },
    benchmark: { label: 'Benchmark', color: theme.palette.grey[400] }
  };

  return (
    <Box>
      <Typography variant="h5" gutterBottom sx={{ fontWeight: 'bold', mb: 3 }}>
        Content Analysis
      </Typography>

      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 3 }}>
        <Card sx={{ borderRadius: 2, height: '400px' }}>
          <CardContent sx={{ p: 3, height: '100%' }}>
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
              Content Distribution
            </Typography>
            {contentTypes.length > 0 ? (
              <ChartContainer config={chartConfig} className="h-80">
                <PieChart>
                  <Pie
                    data={contentTypes}
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    fill={theme.palette.grey[400]}
                    dataKey="value"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  >
                    {contentTypes.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <ChartTooltip content={<ChartTooltipContent />} />
                </PieChart>
              </ChartContainer>
            ) : (
              <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '300px' }}>
                <Typography variant="body2" color="text.secondary">
                  No content data found for visualization
                </Typography>
              </Box>
            )}
          </CardContent>
        </Card>

        <Card sx={{ borderRadius: 2, height: '400px' }}>
          <CardContent sx={{ p: 3, height: '100%' }}>
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
              Content Structure Analysis
            </Typography>
            <ChartContainer config={chartConfig} className="h-80">
              <BarChart data={contentStructureData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <XAxis dataKey="metric" tick={{ fontSize: 10 }} />
                <YAxis domain={[0, 100]} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar dataKey="score" fill={theme.palette.primary.main} />
                <Bar dataKey="benchmark" fill={theme.palette.grey[300]} />
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>
      </Box>

      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '2fr 1fr' }, gap: 3, mt: 3 }}>
        <Card sx={{ borderRadius: 2 }}>
          <CardContent sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
              Text Content Quality
            </Typography>
            
            <Box sx={{ mb: 3 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography variant="body2">Readability Score (Flesch Reading Ease)</Typography>
                <Typography variant="body2">{readabilityScore}%</Typography>
              </Box>
              <LinearProgress 
                variant="determinate" 
                value={readabilityScore} 
                sx={{ 
                  height: 8, 
                  borderRadius: 4, 
                  backgroundColor: theme.palette.grey[200], 
                  '& .MuiLinearProgress-bar': { 
                    backgroundColor: readabilityScore >= 60 ? theme.palette.success.main : theme.palette.warning.main 
                  } 
                }} 
              />
              <Typography variant="caption" color="text.secondary">
                {readabilityScore >= 90 ? 'Very Easy' : 
                 readabilityScore >= 80 ? 'Easy' :
                 readabilityScore >= 70 ? 'Fairly Easy' :
                 readabilityScore >= 60 ? 'Standard' :
                 readabilityScore >= 50 ? 'Fairly Difficult' :
                 readabilityScore >= 30 ? 'Difficult' : 'Very Difficult'}
              </Typography>
            </Box>

            <Box sx={{ mb: 3 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography variant="body2">Text Accessibility Score</Typography>
                <Typography variant="body2">{Math.round(textAccessibilityScore)}%</Typography>
              </Box>
              <LinearProgress 
                variant="determinate" 
                value={textAccessibilityScore} 
                sx={{ 
                  height: 8, 
                  borderRadius: 4, 
                  backgroundColor: theme.palette.grey[200], 
                  '& .MuiLinearProgress-bar': { backgroundColor: theme.palette.info.main } 
                }} 
              />
            </Box>

            <Box sx={{ mb: 3 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography variant="body2">Alt Text Coverage</Typography>
                <Typography variant="body2">
                  {totalImages > 0 ? Math.round((estimatedPhotos / totalImages) * 100) : 0}%
                </Typography>
              </Box>
              <LinearProgress 
                variant="determinate" 
                value={totalImages > 0 ? (estimatedPhotos / totalImages) * 100 : 0} 
                sx={{ 
                  height: 8, 
                  borderRadius: 4, 
                  backgroundColor: theme.palette.grey[200], 
                  '& .MuiLinearProgress-bar': { backgroundColor: theme.palette.success.main } 
                }} 
              />
            </Box>
          </CardContent>
        </Card>

        <Card sx={{ borderRadius: 2 }}>
          <CardContent sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
              Content Metadata
            </Typography>
            
            <Box sx={{ mb: 2 }}>
              <Typography variant="body2" color="text.secondary">Title Tag</Typography>
              <Typography variant="body2" sx={{ fontWeight: 'bold', wordBreak: 'break-word' }}>
                {metaTags.title ? '✓ Present' : '✗ Missing'}
              </Typography>
            </Box>

            <Box sx={{ mb: 2 }}>
              <Typography variant="body2" color="text.secondary">Meta Description</Typography>
              <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                {metaTags.description ? '✓ Present' : '✗ Missing'}
              </Typography>
            </Box>

            <Box sx={{ mb: 2 }}>
              <Typography variant="body2" color="text.secondary">Open Graph Tags</Typography>
              <Typography variant="body2">
                {metaTags['og:title'] || metaTags['og:description'] ? '✓ Present' : '✗ Missing'}
              </Typography>
            </Box>

            <Box sx={{ mb: 2 }}>
              <Typography variant="body2" color="text.secondary">Canonical URL</Typography>
              <Typography variant="body2">
                {metaTags.canonical ? '✓ Present' : '✗ Missing'}
              </Typography>
            </Box>

            <Box>
              <Typography variant="body2" color="text.secondary">Content Images</Typography>
              <Typography variant="body2">{totalImages} total images detected</Typography>
            </Box>
          </CardContent>
        </Card>
      </Box>
    </Box>
  );
};

export default ContentAnalysisTab;


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

  // Extract content data from API response
  const imageData = data.data?.ui?.imageAnalysis;
  const totalImages = imageData?.totalImages || 0;
  const estimatedPhotos = imageData?.estimatedPhotos || 0;
  const estimatedIcons = imageData?.estimatedIcons || 0;

  // Create content distribution data
  const contentTypes = [
    { name: 'Photos', value: estimatedPhotos, color: theme.palette.primary.main },
    { name: 'Icons', value: estimatedIcons, color: theme.palette.success.main },
    { name: 'Other Images', value: Math.max(0, totalImages - estimatedPhotos - estimatedIcons), color: theme.palette.warning.main },
  ].filter(item => item.value > 0);

  // Mock readability data (since not available in current API response)
  const readabilityData = [
    { metric: 'Flesch Reading Ease', score: data.readabilityScore || 75 },
    { metric: 'SEO Score', score: (data.seoScore || 0) * 100 },
    { metric: 'Performance', score: (data.performanceScore || 0) * 100 },
    { metric: 'Overall Quality', score: data.data?.overview?.overallScore || 70 },
  ];

  // Use theme for chart config
  const chartConfig = {
    score: { label: 'Score', color: theme.palette.primary.main }
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
              Quality Metrics
            </Typography>
            <ChartContainer config={chartConfig} className="h-80">
              <BarChart data={readabilityData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <XAxis dataKey="metric" tick={{ fontSize: 10 }} />
                <YAxis domain={[0, 100]} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar dataKey="score" fill={theme.palette.success.main} />
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>
      </Box>

      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '2fr 1fr' }, gap: 3, mt: 3 }}>
        <Card sx={{ borderRadius: 2 }}>
          <CardContent sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
              Content Quality Metrics
            </Typography>
            
            <Box sx={{ mb: 3 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography variant="body2">SEO Score</Typography>
                <Typography variant="body2">{Math.round((data.seoScore || 0) * 100)}%</Typography>
              </Box>
              <LinearProgress 
                variant="determinate" 
                value={(data.seoScore || 0) * 100} 
                sx={{ 
                  height: 8, 
                  borderRadius: 4, 
                  backgroundColor: theme.palette.grey[200], 
                  '& .MuiLinearProgress-bar': { backgroundColor: theme.palette.success.main } 
                }} 
              />
            </Box>

            <Box sx={{ mb: 3 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography variant="body2">Performance Score</Typography>
                <Typography variant="body2">{Math.round((data.performanceScore || 0) * 100)}%</Typography>
              </Box>
              <LinearProgress 
                variant="determinate" 
                value={(data.performanceScore || 0) * 100} 
                sx={{ 
                  height: 8, 
                  borderRadius: 4, 
                  backgroundColor: theme.palette.grey[200], 
                  '& .MuiLinearProgress-bar': { backgroundColor: theme.palette.primary.main } 
                }} 
              />
            </Box>

            <Box sx={{ mb: 3 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography variant="body2">Readability Score</Typography>
                <Typography variant="body2">{data.readabilityScore || 0}%</Typography>
              </Box>
              <LinearProgress 
                variant="determinate" 
                value={data.readabilityScore || 0} 
                sx={{ 
                  height: 8, 
                  borderRadius: 4, 
                  backgroundColor: theme.palette.grey[200], 
                  '& .MuiLinearProgress-bar': { backgroundColor: theme.palette.warning.main } 
                }} 
              />
            </Box>

            <Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography variant="body2">Overall Score</Typography>
                <Typography variant="body2">{data.data?.overview?.overallScore || 0}%</Typography>
              </Box>
              <LinearProgress 
                variant="determinate" 
                value={data.data?.overview?.overallScore || 0} 
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
              Content Statistics
            </Typography>
            
            <Box sx={{ mb: 2 }}>
              <Typography variant="body2" color="text.secondary">Total Images</Typography>
              <Typography variant="h6" sx={{ fontWeight: 'bold' }}>{totalImages}</Typography>
            </Box>

            <Box sx={{ mb: 2 }}>
              <Typography variant="body2" color="text.secondary">Estimated Photos</Typography>
              <Typography variant="h6" sx={{ fontWeight: 'bold' }}>{estimatedPhotos}</Typography>
            </Box>

            <Box sx={{ mb: 2 }}>
              <Typography variant="body2" color="text.secondary">Estimated Icons</Typography>
              <Typography variant="h6" sx={{ fontWeight: 'bold' }}>{estimatedIcons}</Typography>
            </Box>

            <Box sx={{ mb: 2 }}>
              <Typography variant="body2" color="text.secondary">Tech Stack</Typography>
              <Typography variant="body2">
                {data.data?.technical?.techStack?.length || 0} technologies detected
              </Typography>
            </Box>

            <Box>
              <Typography variant="body2" color="text.secondary">Page Load Time</Typography>
              <Typography variant="body2">{data.data?.overview?.pageLoadTime || 'N/A'}</Typography>
            </Box>
          </CardContent>
        </Card>
      </Box>
    </Box>
  );
};

export default ContentAnalysisTab;

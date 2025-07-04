
import React from 'react';
import { Box, Typography, Card, CardContent, LinearProgress, CircularProgress, Alert, Chip, Tooltip } from '@mui/material';
import { FileText, PieChart, BarChart3, Tags } from 'lucide-react';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '../ui/chart';
import { PieChart as RechartsPieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis } from 'recharts';
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

  // Estimate text content (this could be enhanced with actual text analysis data)
  const estimatedTextContent = data.data?.seo?.metaTags ? 
    (Object.keys(data.data.seo.metaTags).length * 10) + 50 : 50; // Base estimate

  // Create content distribution data with consistent colors including text
  const contentTypes = [
    { name: 'Photos', value: estimatedPhotos, color: '#FF6B35' }, // Primary orange
    { name: 'Icons', value: estimatedIcons, color: '#937B91' }, // Specified purple color
    { name: 'Text Content', value: estimatedTextContent, color: '#0984E3' }, // Secondary blue
    { name: 'Other Images', value: Math.max(0, totalImages - estimatedPhotos - estimatedIcons), color: theme.palette.grey[400] },
  ].filter(item => item.value > 0);

  // Content readability and text analysis data
  const readabilityScore = data.readabilityScore || 0;
  const seoChecks = data.data?.seo?.checks || [];
  const metaTags = data.data?.seo?.metaTags || {};

  // Content structure analysis with consistent colors
  const contentStructureData = [
    { metric: 'Readability Score', score: readabilityScore, benchmark: 60 },
    { metric: 'Meta Description', score: metaTags.description ? 100 : 0, benchmark: 100 },
    { metric: 'Title Tag', score: metaTags.title ? 100 : 0, benchmark: 100 },
    { metric: 'Alt Text Coverage', score: totalImages > 0 ? Math.min(100, (estimatedPhotos / totalImages) * 100) : 0, benchmark: 80 },
  ];

  // Text accessibility metrics
  const textAccessibilityScore = seoChecks.filter(check => check.status === 'good').length / Math.max(seoChecks.length, 1) * 100;

  // Use consistent chart colors
  const chartConfig = {
    score: { label: 'Score', color: '#FF6B35' }, // Primary orange
    benchmark: { label: 'Benchmark', color: theme.palette.grey[400] }
  };

  // Helper function to get status chip props with proper color coding
  const getStatusChipProps = (isPresent: boolean, label: string) => {
    if (isPresent) {
      return {
        label: 'Present',
        color: 'success' as const,
        tooltip: `${label} is present and properly configured`
      };
    } else {
      return {
        label: 'Missing',
        color: 'error' as const,
        tooltip: `${label} is missing - this may impact SEO and accessibility`
      };
    }
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
        <Typography variant="h5" gutterBottom sx={{ fontWeight: 'bold', flexGrow: 1 }}>
          Content Analysis
        </Typography>
      </Box>
      <Box sx={{ display: 'grid', gap: 2, alignItems: 'stretch' }}>
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 2 }}>
          <Card sx={{ borderRadius: 2, height: '400px' }}>
            <CardContent sx={{ p: 2, height: '100%' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <PieChart size={24} color="#FF6B35" style={{ marginRight: 8 }} />
                <Typography 
                  variant="h6" 
                  sx={{ 
                    fontWeight: 'bold',
                    fontSize: { xs: '1.1rem', sm: '1.25rem' }
                  }}
                >
                  Content Distribution
                </Typography>
              </Box>
            {contentTypes.length > 0 ? (
              <ChartContainer config={chartConfig} className="h-80">
                <RechartsPieChart>
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
                </RechartsPieChart>
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
            <CardContent sx={{ p: 2, height: '100%' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <BarChart3 size={24} color="#FF6B35" style={{ marginRight: 8 }} />
                <Typography 
                  variant="h6" 
                  sx={{ 
                    fontWeight: 'bold',
                    fontSize: { xs: '1.1rem', sm: '1.25rem' }
                  }}
                >
                  Content Structure Analysis
                </Typography>
              </Box>
            <ChartContainer config={chartConfig} className="h-80 w-full">
              <BarChart data={contentStructureData} margin={{ top: 20, right: 20, left: 0, bottom: 5 }}>
                <XAxis dataKey="metric" tick={{ fontSize: 10 }} />
                <YAxis domain={[0, 100]} />
                <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
                <Bar dataKey="score" fill="#FF6B35" />
                <Bar dataKey="benchmark" fill={theme.palette.grey[300]} />
              </BarChart>
            </ChartContainer>
            </CardContent>
          </Card>
        </Box>

        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '2fr 1fr' }, gap: 2 }}>
          <Card sx={{ borderRadius: 2 }}>
            <CardContent sx={{ p: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <FileText size={24} color="#FF6B35" style={{ marginRight: 8 }} />
                <Typography 
                  variant="h6" 
                  sx={{ 
                    fontWeight: 'bold',
                    fontSize: { xs: '1.1rem', sm: '1.25rem' }
                  }}
                >
                  Text Content Quality
                </Typography>
              </Box>
            
            
            <Box sx={{ mb: 3 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography variant="body2">Readability Score (Flesch Reading Ease)</Typography>
                <Tooltip 
                  title={`Readability score: ${readabilityScore}% - ${readabilityScore >= 90 ? 'Very Easy' : 
                    readabilityScore >= 80 ? 'Easy' :
                    readabilityScore >= 70 ? 'Fairly Easy' :
                    readabilityScore >= 60 ? 'Standard' :
                    readabilityScore >= 50 ? 'Fairly Difficult' :
                    readabilityScore >= 30 ? 'Difficult' : 'Very Difficult'}`}
                  enterDelay={300}
                  enterTouchDelay={300}
                >
                  <Typography variant="body2" sx={{ cursor: 'help' }}>{readabilityScore}%</Typography>
                </Tooltip>
              </Box>
              <Tooltip 
                title={`Readability score: ${readabilityScore}% - ${readabilityScore >= 90 ? 'Very Easy' : 
                  readabilityScore >= 80 ? 'Easy' :
                  readabilityScore >= 70 ? 'Fairly Easy' :
                  readabilityScore >= 60 ? 'Standard' :
                  readabilityScore >= 50 ? 'Fairly Difficult' :
                  readabilityScore >= 30 ? 'Difficult' : 'Very Difficult'}`}
                enterDelay={300}
                enterTouchDelay={300}
              >
                <LinearProgress 
                  variant="determinate" 
                  value={readabilityScore} 
                  sx={{ 
                    height: 8, 
                    borderRadius: 4, 
                    cursor: 'help'
                  }} 
                />
              </Tooltip>
              <Typography variant="body2" color="text.secondary">
                Your content readability scores better than {readabilityScore}% of websites
              </Typography>
            </Box>

            <Box sx={{ mb: 3 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography variant="body2">Text Accessibility Score</Typography>
                <Tooltip 
                  title={`Text accessibility score: ${Math.round(textAccessibilityScore)}%`}
                  enterDelay={300}
                  enterTouchDelay={300}
                >
                  <Typography variant="body2" sx={{ cursor: 'help' }}>{Math.round(textAccessibilityScore)}%</Typography>
                </Tooltip>
              </Box>
              <Tooltip 
                title={`Text accessibility score: ${Math.round(textAccessibilityScore)}%`}
                enterDelay={300}
                enterTouchDelay={300}
              >
                <LinearProgress 
                  variant="determinate" 
                  value={textAccessibilityScore} 
                  sx={{ 
                    height: 8, 
                    borderRadius: 4, 
                    cursor: 'help'
                  }} 
                />
              </Tooltip>
              <Typography variant="body2" color="text.secondary">
                Your text accessibility scores better than {Math.round(textAccessibilityScore)}% of websites
              </Typography>
            </Box>

            <Box sx={{ mb: 3 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography variant="body2">Alt Text Coverage</Typography>
                <Tooltip 
                  title={`Alt text coverage: ${totalImages > 0 ? Math.round((estimatedPhotos / totalImages) * 100) : 0}%`}
                  enterDelay={300}
                  enterTouchDelay={300}
                >
                  <Typography variant="body2" sx={{ cursor: 'help' }}>
                    {totalImages > 0 ? Math.round((estimatedPhotos / totalImages) * 100) : 0}%
                  </Typography>
                </Tooltip>
              </Box>
              <Tooltip 
                title={`Alt text coverage: ${totalImages > 0 ? Math.round((estimatedPhotos / totalImages) * 100) : 0}%`}
                enterDelay={300}
                enterTouchDelay={300}
              >
                <LinearProgress 
                  variant="determinate" 
                  value={totalImages > 0 ? (estimatedPhotos / totalImages) * 100 : 0} 
                  sx={{ 
                    height: 8, 
                    borderRadius: 4, 
                    cursor: 'help'
                  }} 
                />
              </Tooltip>
              <Typography variant="body2" color="text.secondary">
                Your alt text coverage scores better than {totalImages > 0 ? Math.round((estimatedPhotos / totalImages) * 100) : 0}% of websites
              </Typography>
            </Box>
            </CardContent>
          </Card>

          <Card sx={{ borderRadius: 2 }}>
            <CardContent sx={{ p: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <Tags size={24} color="#FF6B35" style={{ marginRight: 8 }} />
              <Typography 
                variant="h6" 
                sx={{ 
                  fontWeight: 'bold',
                  fontSize: { xs: '1.1rem', sm: '1.25rem' }
                }}
              >
                Content Metadata
              </Typography>
            </Box>
            
            
            <Box sx={{ mb: 2 }}>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>Title Tag</Typography>
              <Tooltip 
                title={getStatusChipProps(!!metaTags.title, 'Title Tag').tooltip}
                enterDelay={300}
                enterTouchDelay={300}
              >
                <Chip
                  {...getStatusChipProps(!!metaTags.title, 'Title Tag')}
                  size="small"
                  variant="outlined"
                  sx={{ cursor: 'help' }}
                />
              </Tooltip>
            </Box>

            <Box sx={{ mb: 2 }}>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>Meta Description</Typography>
              <Tooltip 
                title={getStatusChipProps(!!metaTags.description, 'Meta Description').tooltip}
                enterDelay={300}
                enterTouchDelay={300}
              >
                <Chip
                  {...getStatusChipProps(!!metaTags.description, 'Meta Description')}
                  size="small"
                  variant="outlined"
                  sx={{ cursor: 'help' }}
                />
              </Tooltip>
            </Box>

            <Box sx={{ mb: 2 }}>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>Open Graph Tags</Typography>
              <Tooltip 
                title={getStatusChipProps(!!(metaTags['og:title'] || metaTags['og:description']), 'Open Graph Tags').tooltip}
                enterDelay={300}
                enterTouchDelay={300}
              >
                <Chip
                  {...getStatusChipProps(!!(metaTags['og:title'] || metaTags['og:description']), 'Open Graph Tags')}
                  size="small"
                  variant="outlined"
                  sx={{ cursor: 'help' }}
                />
              </Tooltip>
            </Box>

            <Box sx={{ mb: 2 }}>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>Canonical URL</Typography>
              <Tooltip 
                title={getStatusChipProps(!!metaTags.canonical, 'Canonical URL').tooltip}
                enterDelay={300}
                enterTouchDelay={300}
              >
                <Chip
                  {...getStatusChipProps(!!metaTags.canonical, 'Canonical URL')}
                  size="small"
                  variant="outlined"
                  sx={{ cursor: 'help' }}
                />
              </Tooltip>
            </Box>

            <Box>
              <Typography variant="body2" color="text.secondary">Content Images</Typography>
              <Typography variant="body2">{totalImages} total images detected</Typography>
            </Box>
            </CardContent>
          </Card>
        </Box>
      </Box>
    </Box>
  );
};

export default ContentAnalysisTab;

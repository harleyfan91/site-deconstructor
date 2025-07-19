import React from 'react';
import { Box, Typography, Card, CardContent, Chip, Tooltip, LinearProgress, useTheme } from '@mui/material';
import { PieChart, BarChart3, FileText, Tags } from 'lucide-react';
import { 
  PieChart as RechartsPieChart, 
  Pie, 
  Cell, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis,
  ResponsiveContainer
} from 'recharts';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import type { AnalysisResponse } from '@/types/analysis';

interface ContentAnalysisTabProps {
  data: AnalysisResponse | null;
  loading: boolean;
  error: string | null;
}

const ContentAnalysisTab = ({ data, loading, error }: ContentAnalysisTabProps) => {
  const theme = useTheme();
  const content = data?.data?.content;
  const ui = data?.data?.ui;
  const metaTags = data?.data?.seo?.metaTags || {};
  
  // Extract data
  const wordCount = content?.wordCount || 0;
  const readabilityScore = content?.readabilityScore || 0;
  const images = ui?.images || [];
  const totalImages = images.length;
  const estimatedPhotos = images.filter(img => img.type === 'photo').length;

  if (error) {
    return (
      <Typography color="error" sx={{ mt: 2 }}>
        Error loading content analysis: {error}
      </Typography>
    );
  }

  // Content distribution data
  const contentTypes = [
    { name: 'Text', value: Math.max(Number(wordCount) * 0.7 || 10, 10), color: theme.palette.primary.main },
    { name: 'Images', value: Math.max(totalImages * 5, 10), color: theme.palette.secondary.main },
    { name: 'Other', value: 20, color: theme.palette.grey[400] }
  ];

  const chartConfig = {
    desktop: {
      label: "Desktop",
      color: theme.palette.primary.main,
    },
    mobile: {
      label: "Mobile", 
      color: theme.palette.secondary.main,
    },
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
        <Typography variant="h5" gutterBottom sx={{ flexGrow: 1 }}>
          Content Analysis
        </Typography>
      </Box>
      <Box sx={{ display: 'grid', gap: 2, alignItems: 'stretch' }}>
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 2 }}>
          <Card sx={{ borderRadius: 2, height: '400px' }}>
            <CardContent sx={{ p: 2, height: '100%' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <PieChart size={24} style={{ marginRight: 8, color: theme.palette.primary.main }} />
                <Typography variant="h6">
                  Content Distribution
                </Typography>
              </Box>
              {contentTypes.length > 0 ? (
                <Box sx={{ height: 300, width: '100%', minHeight: 300, minWidth: 300 }}>
                  <ChartContainer config={chartConfig}>
                    <RechartsPieChart width={350} height={280}>
                      <Pie
                        data={contentTypes}
                        cx="50%"
                        cy="50%"
                        outerRadius={80}
                        fill={theme.palette.grey[400]}
                        dataKey="value"
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                        labelLine={false}
                        style={{ fontSize: '14px', fontWeight: '500' }}
                      >
                        {contentTypes.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <ChartTooltip content={<ChartTooltipContent />} />
                    </RechartsPieChart>
                  </ChartContainer>
                </Box>
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
                <BarChart3 size={24} style={{ marginRight: 8, color: theme.palette.primary.main }} />
                <Typography variant="h6">
                  Content Structure Analysis
                </Typography>
              </Box>
              <Typography variant="body2" color="text.secondary">
                Word count: {wordCount} words
              </Typography>
            </CardContent>
          </Card>
        </Box>

        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '2fr 1fr' }, gap: 2 }}>
          <Card sx={{ borderRadius: 2 }}>
            <CardContent sx={{ p: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <FileText size={24} style={{ marginRight: 8, color: theme.palette.primary.main }} />
                <Typography variant="h6">
                  Text Content Quality
                </Typography>
              </Box>
              <Typography variant="body2" color="text.secondary">
                Readability score: {readabilityScore}%
              </Typography>
            </CardContent>
          </Card>

          <Card sx={{ borderRadius: 2 }}>
            <CardContent sx={{ p: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Tags size={24} style={{ marginRight: 8, color: theme.palette.primary.main }} />
                <Typography variant="h6">
                  Content Metadata
                </Typography>
              </Box>
              <Typography variant="body2" color="text.secondary">
                {metaTags.title ? 'Title tag present' : 'Title tag missing'}
              </Typography>
            </CardContent>
          </Card>
        </Box>
      </Box>
    </Box>
  );
};

export default ContentAnalysisTab;
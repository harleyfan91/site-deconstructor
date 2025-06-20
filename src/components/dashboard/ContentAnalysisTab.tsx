import React from 'react';
import { Box, Typography, Grid, Card, CardContent, LinearProgress } from '@mui/material';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '../ui/chart';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis } from 'recharts';
import { useTheme } from '@mui/material/styles';

const ContentAnalysisTab = () => {
  const theme = useTheme();
  // Use theme colors for contentTypes
  const contentTypes = [
    { name: 'Text', value: 65, color: theme.palette.primary.main },
    { name: 'Images', value: 20, color: theme.palette.success.main },
    { name: 'Videos', value: 10, color: theme.palette.warning.main },
    { name: 'Links', value: 5, color: theme.palette.secondary.main },
  ];

  const readabilityData = [
    { metric: 'Flesch Reading Ease', score: 78 },
    { metric: 'Grade Level', score: 85 },
    { metric: 'Sentence Length', score: 92 },
    { metric: 'Word Complexity', score: 88 },
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
          </CardContent>
        </Card>

        <Card sx={{ borderRadius: 2, height: '400px' }}>
          <CardContent sx={{ p: 3, height: '100%' }}>
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
              Readability Analysis
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
                <Typography variant="body2">Keyword Density</Typography>
                <Typography variant="body2">2.3%</Typography>
              </Box>
              <LinearProgress variant="determinate" value={75} sx={{ height: 8, borderRadius: 4, backgroundColor: theme.palette.grey[200], '& .MuiLinearProgress-bar': { backgroundColor: theme.palette.success.main } }} />
            </Box>

            <Box sx={{ mb: 3 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography variant="body2">Content Freshness</Typography>
                <Typography variant="body2">85%</Typography>
              </Box>
              <LinearProgress variant="determinate" value={85} sx={{ height: 8, borderRadius: 4, backgroundColor: theme.palette.grey[200], '& .MuiLinearProgress-bar': { backgroundColor: theme.palette.primary.main } }} />
            </Box>

            <Box sx={{ mb: 3 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography variant="body2">Engagement Score</Typography>
                <Typography variant="body2">78%</Typography>
              </Box>
              <LinearProgress variant="determinate" value={78} sx={{ height: 8, borderRadius: 4, backgroundColor: theme.palette.grey[200], '& .MuiLinearProgress-bar': { backgroundColor: theme.palette.warning.main } }} />
            </Box>

            <Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography variant="body2">Originality</Typography>
                <Typography variant="body2">94%</Typography>
              </Box>
              <LinearProgress variant="determinate" value={94} sx={{ height: 8, borderRadius: 4, backgroundColor: theme.palette.grey[200], '& .MuiLinearProgress-bar': { backgroundColor: theme.palette.success.main } }} />
            </Box>
          </CardContent>
        </Card>

        <Card sx={{ borderRadius: 2 }}>
          <CardContent sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
              Content Statistics
            </Typography>
            
            <Box sx={{ mb: 2 }}>
              <Typography variant="body2" color="text.secondary">Total Words</Typography>
              <Typography variant="h6" sx={{ fontWeight: 'bold' }}>1,247</Typography>
            </Box>

            <Box sx={{ mb: 2 }}>
              <Typography variant="body2" color="text.secondary">Average Reading Time</Typography>
              <Typography variant="h6" sx={{ fontWeight: 'bold' }}>5.2 min</Typography>
            </Box>

            <Box sx={{ mb: 2 }}>
              <Typography variant="body2" color="text.secondary">Headings Structure</Typography>
              <Typography variant="body2">H1: 1, H2: 4, H3: 8</Typography>
            </Box>

            <Box sx={{ mb: 2 }}>
              <Typography variant="body2" color="text.secondary">Images</Typography>
              <Typography variant="body2">12 total, 3 missing alt text</Typography>
            </Box>

            <Box>
              <Typography variant="body2" color="text.secondary">Internal Links</Typography>
              <Typography variant="body2">15 links found</Typography>
            </Box>
          </CardContent>
        </Card>
      </Box>
    </Box>
  );
};

export default ContentAnalysisTab;

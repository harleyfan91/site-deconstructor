import React from 'react';
import { Box, Typography, Grid, Card, CardContent, CircularProgress, Alert } from '@mui/material';
import type { AnalysisResponse } from '@/types/analysis';
import ColorExtractionCard from './ui-analysis/ColorExtractionCard';
import FontAnalysisCard from './ui-analysis/FontAnalysisCard';
import ImageAnalysisCard from './ui-analysis/ImageAnalysisCard';
import ContrastWarningsCard from './ui-analysis/ContrastWarningsCard';

interface UIAnalysisTabProps {
  data: AnalysisResponse | null;
  loading: boolean;
  error: string | null;
}

const UIAnalysisTab: React.FC<UIAnalysisTabProps> = ({ data, loading, error }) => {
  // Loading state
  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', py: 8 }}>
        <CircularProgress size={60} />
        <Typography variant="h6" sx={{ ml: 2 }}>Analyzing UI...</Typography>
      </Box>
    );
  }

  // Error state
  if (error) {
    return (
      <Alert severity="error" sx={{ mt: 2 }}>
        {error}
      </Alert>
    );
  }

  // No data yet state
  if (!data) {
    return (
      <Alert severity="info" sx={{ mt: 2 }}>
        Enter a URL to analyze UI elements
      </Alert>
    );
  }

  // Destructure UI data
  const { ui } = data.data;

  return (
    <Box>
      <Typography variant="h5" gutterBottom sx={{ fontWeight: 'bold', mb: 3 }}>
        UI Analysis
      </Typography>

      {/* Color Extraction Section */}
      <Card sx={{ borderRadius: 2, mb: 3 }}>
        <CardContent sx={{ p: 3 }}>
          <ColorExtractionCard colors={ui.colors} />
        </CardContent>
      </Card>

      {/* Font Analysis & Contrast Warnings Section */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} md={6}>
          <Card sx={{ borderRadius: 2, height: '100%' }}>
            <CardContent sx={{ p: 3 }}>
              <FontAnalysisCard fonts={ui.fonts} />
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={6}>
          <Card sx={{ borderRadius: 2, height: '100%' }}>
            <CardContent sx={{ p: 3 }}>
              <ContrastWarningsCard issues={ui.contrastIssues} />
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Image Analysis Section */}
      <Card sx={{ borderRadius: 2, mb: 3 }}>
        <CardContent sx={{ p: 3 }}>
          <ImageAnalysisCard images={ui.images} imageAnalysis={ui.imageAnalysis} />
        </CardContent>
      </Card>
    </Box>
  );
};

export default UIAnalysisTab;

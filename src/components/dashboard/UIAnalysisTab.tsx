
import React from 'react';
import { Box, Typography, Card, CardContent, CircularProgress, Alert } from '@mui/material';
import Grid2 from '@mui/material/Unstable_Grid2';
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
  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', py: 8 }}>
        <CircularProgress size={60} />
        <Typography variant="h6" sx={{ ml: 2 }}>Analyzing UI elements...</Typography>
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
        Enter a URL to analyze website UI elements
      </Alert>
    );
  }

  const { colors, fonts, images, imageAnalysis } = data.data.ui;

  return (
    <Box>
      <Typography variant="h5" gutterBottom sx={{ fontWeight: 'bold', mb: 3 }}>
        User Interface Analysis
      </Typography>

      <Grid2 container spacing={2} alignItems="stretch">
        {/* Color Extraction */}
        <Grid2 size={12} sx={{ display: 'flex', width: '100%' }}>
          <Card sx={{ borderRadius: 2, flexGrow: 1, width: '100%' }}>
            <CardContent sx={{ p: 3 }}>
              <ColorExtractionCard colors={colors} />
            </CardContent>
          </Card>
        </Grid2>

        {/* Font Analysis */}
        <Grid2 size={{ xs: 12, md: 6 }} sx={{ display: 'flex', width: '100%' }}>
          <Card sx={{ borderRadius: 2, flexGrow: 1, width: '100%' }}>
            <CardContent sx={{ p: 3 }}>
              <FontAnalysisCard fonts={fonts} />
            </CardContent>
          </Card>
        </Grid2>

        {/* Contrast Warnings */}
        <Grid2 size={{ xs: 12, md: 6 }} sx={{ display: 'flex', width: '100%' }}>
          <Card sx={{ borderRadius: 2, flexGrow: 1, width: '100%' }}>
            <CardContent sx={{ p: 3 }}>
              <ContrastWarningsCard issues={data.data.ui.contrastIssues} />
            </CardContent>
          </Card>
        </Grid2>

        {/* Image Analysis */}
        <Grid2 size={12} sx={{ display: 'flex', width: '100%' }}>
          <Card sx={{ borderRadius: 2, flexGrow: 1, width: '100%' }}>
            <CardContent sx={{ p: 3 }}>
              <ImageAnalysisCard
                images={images}
                imageAnalysis={imageAnalysis}
              />
            </CardContent>
          </Card>
        </Grid2>
      </Grid2>
    </Box>
  );
};

export default UIAnalysisTab;


import React from 'react';
import { Box, Typography, Card, CardContent, CircularProgress, Alert } from '@mui/material';
import type { AnalysisResponse } from '@/types/analysis';
import ColorExtractionCard from './ui-analysis/ColorExtractionCard';
import FontAnalysisCard from './ui-analysis/FontAnalysisCard';
import ImageAnalysisCard from './ui-analysis/ImageAnalysisCard';
import ContrastWarningsCard from './ui-analysis/ContrastWarningsCard';
import ColorLegend from './ColorLegend';

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
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
        <Typography variant="h5" gutterBottom sx={{ fontWeight: 'bold', mb: 0, mr: 2 }}>
          User Interface Analysis
        </Typography>
        <ColorLegend />
      </Box>

      <Box sx={{ display: 'grid', gap: 2, alignItems: 'stretch' }}>
        {/* Color Extraction */}
        <Card sx={{ borderRadius: 2, width: '100%' }}>
          <CardContent sx={{ p: 2 }}>
            <ColorExtractionCard colors={colors} />
          </CardContent>
        </Card>

        {/* Font Analysis and Contrast Warnings */}
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 2 }}>
          <Card sx={{ borderRadius: 2, width: '100%' }}>
            <CardContent sx={{ p: 2 }}>
              <FontAnalysisCard fonts={fonts} />
            </CardContent>
          </Card>

          <Card sx={{ borderRadius: 2, width: '100%' }}>
            <CardContent sx={{ p: 2 }}>
              <ContrastWarningsCard issues={data.data.ui.contrastIssues} />
            </CardContent>
          </Card>
        </Box>

        {/* Image Analysis */}
        <Card sx={{ borderRadius: 2, width: '100%' }}>
          <CardContent sx={{ p: 2 }}>
            <ImageAnalysisCard
              images={images}
              imageAnalysis={imageAnalysis}
            />
          </CardContent>
        </Card>
      </Box>
    </Box>
  );
};

export default UIAnalysisTab;

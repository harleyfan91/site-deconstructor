
import React from 'react';
import { Box, Typography, Grid, CircularProgress, Alert } from '@mui/material';
import { AnalysisResponse } from '../../hooks/useAnalysisApi';
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
  
  console.log('Image analysis data:', imageAnalysis);
  
  return (
    <Box>
      <Typography variant="h5" gutterBottom sx={{ fontWeight: 'bold', mb: 3 }}>
        User Interface Analysis
      </Typography>

      <Grid container spacing={3}>
        {/* Color Extraction */}
        <Grid item xs={12} md={6}>
          <ColorExtractionCard colors={colors} />
        </Grid>

        {/* Font Analysis */}
        <Grid item xs={12} md={6}>
          <FontAnalysisCard fonts={fonts} />
        </Grid>

        {/* Contrast Warnings */}
        <Grid item xs={12}>
          <ContrastWarningsCard issues={data.data.ui.contrastIssues} />
        </Grid>

        {/* Image Analysis */}
        <Grid item xs={12}>
          <ImageAnalysisCard 
            images={images} 
            imageAnalysis={imageAnalysis} 
          />
        </Grid>
      </Grid>
    </Box>
  );
};

export default UIAnalysisTab;

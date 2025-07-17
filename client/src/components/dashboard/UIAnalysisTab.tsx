
import React from 'react';
import { Box, Typography, Card, CardContent, CircularProgress, Alert } from '@mui/material';
import type { AnalysisResponse } from '@/types/analysis';
import ColorExtractionCard from './ui-analysis/ColorExtractionCard';
import FontAnalysisCard from './ui-analysis/FontAnalysisCard';
import ImageAnalysisCard from './ui-analysis/ImageAnalysisCard';
import AccessibilityCard from './ui-analysis/AccessibilityCard';
import LegendContainer from './LegendContainer';

interface UIAnalysisTabProps {
  data: AnalysisResponse | null;
  loading: boolean;
  error: string | null;
}

const UIAnalysisTab: React.FC<UIAnalysisTabProps> = ({ data, loading, error }) => {
  if (error) {
    return (
      <Alert severity="error" sx={{ mt: 2 }}>
        {error}
      </Alert>
    );
  }

  if (!data && !loading) {
    return (
      <Alert severity="info" sx={{ mt: 2 }}>
        Enter a URL to analyze website UI elements
      </Alert>
    );
  }

  const ui = data?.data?.ui;
  const { colors, fonts, images, imageAnalysis } = ui || {};
  
  // Check if we have any UI data at all - if not and we have data, we're still loading UI components
  const hasUIData = colors || fonts || images || imageAnalysis;
  const isUILoading = data && !hasUIData; // We have initial data but no UI data yet

  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
        <Typography variant="h5" gutterBottom sx={{ flexGrow: 1 }}>
          User Interface Analysis
        </Typography>
      </Box>
      <Box sx={{ display: 'grid', gap: 2, alignItems: 'stretch' }}>
        {/* Color Extraction */}
        <Card sx={{ borderRadius: 2, width: '100%' }}>
          <CardContent sx={{ p: 2 }}>
            <ColorExtractionCard 
              colors={colors} 
              url={data?.url} 
              loading={loading || isUILoading || !colors}
              disableAPICall={true}
            />
          </CardContent>
        </Card>

        {/* Font Analysis and Accessibility & Contrast */}
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 2 }}>
          <Card sx={{ borderRadius: 2, width: '100%' }}>
            <CardContent sx={{ p: 2 }}>
              <FontAnalysisCard 
                fonts={fonts ?? []} 
                url={data?.url} 
                loading={loading || isUILoading || !fonts}
                disableAPICall={true}
              />
            </CardContent>
          </Card>

          <Card sx={{ borderRadius: 2, width: '100%' }}>
            <CardContent sx={{ p: 2 }}>
              <AccessibilityCard 
                url={data?.url}
                contrastIssues={ui?.contrastIssues}
                accessibilityScore={ui?.accessibilityScore}
                altStats={imageAnalysis?.altStats}
                loading={loading || isUILoading || (!ui?.contrastIssues && !ui?.accessibilityScore)}
                disableAPICall={true}
              />
            </CardContent>
          </Card>
        </Box>

        {/* Image Analysis */}
        <Card sx={{ borderRadius: 2, width: '100%' }}>
          <CardContent sx={{ p: 2 }}>
            <ImageAnalysisCard
              images={images ?? []}
              imageAnalysis={imageAnalysis}
            />
          </CardContent>
        </Card>
      </Box>
    </Box>
  );
};

export default UIAnalysisTab;

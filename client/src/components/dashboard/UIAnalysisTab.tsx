
import React from 'react';
import { Box, Typography, Card, CardContent, Alert } from '@mui/material';
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
  const ui = data?.data?.ui;
  const { colors, fonts, images, imageAnalysis, contrastIssues = [], violations = [], accessibilityScore = 0 } = ui || {};

  // Use data directly from unified overview endpoint
  // Show loading when actually loading and no complete data available

  if (error) {
    return (
      <Alert severity="error" sx={{ mt: 2 }}>
        {error}
      </Alert>
    );
  }

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
              colors={colors || []}
            />
          </CardContent>
        </Card>

        {/* Font Analysis and Accessibility & Contrast */}
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 2 }}>
          <Card sx={{ borderRadius: 2, width: '100%' }}>
            <CardContent sx={{ p: 2 }}>
              <FontAnalysisCard
                fonts={fonts ?? []}
              />
            </CardContent>
          </Card>

          <Card sx={{ borderRadius: 2, width: '100%' }}>
            <CardContent sx={{ p: 2 }}>
              <AccessibilityCard
                contrastIssues={contrastIssues?.map(issue => ({
                  element: issue.element || 'unknown',
                  textColor: issue.textColor || issue.foregroundColor || '#000',
                  backgroundColor: issue.backgroundColor || '#fff',
                  ratio: issue.ratio || 0,
                  expectedRatio: 4.5,
                  severity: 'warning',
                  recommendation: 'Improve color contrast'
                })) || []}
                accessibilityScore={accessibilityScore}
                violations={violations}
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

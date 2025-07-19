
import React from 'react';
import { Box, Typography, Card, CardContent, CircularProgress, Alert } from '@mui/material';
import type { AnalysisResponse } from '@/types/analysis';
import ColorExtractionCard from './ui-analysis/ColorExtractionCard';
import FontAnalysisCard from './ui-analysis/FontAnalysisCard';
import ImageAnalysisCard from './ui-analysis/ImageAnalysisCard';
import AccessibilityCard from './ui-analysis/AccessibilityCard';
import LegendContainer from './LegendContainer';
import SkeletonCard from '../ui/SkeletonCard';

interface UIAnalysisTabProps {
  data: AnalysisResponse | null;
  loading: boolean;
  error: string | null;
}

const UIAnalysisTab: React.FC<UIAnalysisTabProps> = ({ data, loading, error }) => {
  const ui = data?.data?.ui;
  const { colors, fonts, images, imageAnalysis, contrastIssues, violations, accessibilityScore } = ui || {};

  // Use data directly from unified overview endpoint
  // Show loading when actually loading and no complete data available
  const showLoadingForColors = loading && (!colors || colors.length === 0);
  const showLoadingForFonts = loading && (!fonts || fonts.length === 0);
  const showLoadingForAccessibility = loading && (!accessibilityScore && !contrastIssues?.length && !violations?.length);
  const showLoadingForImages = loading && (!images || images.length === 0);

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
            {showLoadingForColors ? (
              <Box>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                  <Typography variant="h6">
                    Color Extraction
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', py: 4 }}>
                  <CircularProgress size={32} sx={{ color: 'primary.main', mr: 2 }} />
                  <Typography variant="body2" color="text.secondary">
                    Extracting colors from website...
                  </Typography>
                </Box>
              </Box>
            ) : (
              <ColorExtractionCard 
                colors={colors || []} 
              />
            )}
          </CardContent>
        </Card>

        {/* Font Analysis and Accessibility & Contrast */}
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 2 }}>
          <Card sx={{ borderRadius: 2, width: '100%' }}>
            <CardContent sx={{ p: 2 }}>
              {showLoadingForFonts ? (
                <Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                    <Typography variant="h6">
                      Font Analysis
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', py: 3 }}>
                    <CircularProgress size={32} sx={{ mr: 2 }} />
                    <Typography variant="body2" color="text.secondary">
                      Extracting fonts...
                    </Typography>
                  </Box>
                </Box>
              ) : (
                <FontAnalysisCard 
                  fonts={fonts ?? []} 
                />
              )}
            </CardContent>
          </Card>

          <Card sx={{ borderRadius: 2, width: '100%' }}>
            <CardContent sx={{ p: 2 }}>
              {showLoadingForAccessibility ? (
                <Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                    <Typography variant="h6">
                      Accessibility & Contrast
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', py: 4 }}>
                    <CircularProgress size={24} sx={{ mr: 2 }} />
                    <Typography variant="body2">Analyzing accessibility...</Typography>
                  </Box>
                </Box>
              ) : (
                <AccessibilityCard 
                  contrastIssues={contrastIssues}
                  accessibilityScore={accessibilityScore}
                  violations={violations}
                />
              )}
            </CardContent>
          </Card>
        </Box>

        {/* Image Analysis */}
        <Card sx={{ borderRadius: 2, width: '100%' }}>
          <CardContent sx={{ p: 2 }}>
            {showLoadingForImages ? (
              <Box>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                  <Typography variant="h6">
                    Image Analysis
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', py: 4 }}>
                  <CircularProgress size={32} sx={{ mr: 2 }} />
                  <Typography variant="body2" color="text.secondary">
                    Analyzing images...
                  </Typography>
                </Box>
              </Box>
            ) : (
              <ImageAnalysisCard
                images={images ?? []}
                imageAnalysis={imageAnalysis}
              />
            )}
          </CardContent>
        </Card>
      </Box>
    </Box>
  );
};

export default UIAnalysisTab;

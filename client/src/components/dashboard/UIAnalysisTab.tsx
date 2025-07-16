
import React from 'react';
import { Box, Typography, Card, CardContent, CircularProgress, Alert } from '@mui/material';
import { Palette, Type } from 'lucide-react';
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
            {loading && !colors ? (
              <Box>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                  <Palette size={24} style={{ marginRight: 8, color: '#FF6B35' }} />
                  <Typography variant="h6">Color Extraction</Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', py: 3 }}>
                  <CircularProgress size={24} sx={{ mr: 2 }} />
                  <Typography variant="body2" color="text.secondary">
                    Extracting colors...
                  </Typography>
                </Box>
              </Box>
            ) : (
              <ColorExtractionCard colors={colors} url={data?.url} />
            )}
          </CardContent>
        </Card>

        {/* Font Analysis and Accessibility & Contrast */}
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 2 }}>
          <Card sx={{ borderRadius: 2, width: '100%' }}>
            <CardContent sx={{ p: 2 }}>
              {loading && !fonts ? (
                <Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                    <Type size={24} style={{ marginRight: 8, color: '#FF6B35' }} />
                    <Typography variant="h6">Font Analysis</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', py: 3 }}>
                    <CircularProgress size={24} sx={{ mr: 2 }} />
                    <Typography variant="body2" color="text.secondary">
                      Analyzing fonts...
                    </Typography>
                  </Box>
                </Box>
              ) : (
                <FontAnalysisCard fonts={fonts ?? []} url={data?.url} />
              )}
            </CardContent>
          </Card>

          <Card sx={{ borderRadius: 2, width: '100%' }}>
            <CardContent sx={{ p: 2 }}>
              {loading && !ui?.contrastIssues && !ui?.accessibilityScore ? (
                <Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                    <Box sx={{ width: 24, height: 24, marginRight: 1, color: '#FF6B35' }}>🛡️</Box>
                    <Typography variant="h6">Accessibility & Contrast</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', py: 3 }}>
                    <CircularProgress size={24} sx={{ mr: 2 }} />
                    <Typography variant="body2" color="text.secondary">
                      Analyzing accessibility...
                    </Typography>
                  </Box>
                </Box>
              ) : (
                <AccessibilityCard 
                  url={data?.url} 
                  contrastIssues={ui?.contrastIssues}
                  accessibilityScore={ui?.accessibilityScore}
                  altStats={imageAnalysis?.altStats}
                />
              )}
            </CardContent>
          </Card>
        </Box>

        {/* Image Analysis */}
        <Card sx={{ borderRadius: 2, width: '100%' }}>
          <CardContent sx={{ p: 2 }}>
            {loading && !images ? (
              <Box>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                  <Box sx={{ width: 24, height: 24, marginRight: 1, color: '#FF6B35' }}>🖼️</Box>
                  <Typography variant="h6">Image Analysis</Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', py: 3 }}>
                  <CircularProgress size={24} sx={{ mr: 2 }} />
                  <Typography variant="body2" color="text.secondary">
                    Analyzing images...
                  </Typography>
                </Box>
              </Box>
            ) : (
              <ImageAnalysisCard
                images={images ?? []}
                imageAnalysis={imageAnalysis}
                url={data?.url}
              />
            )}
          </CardContent>
        </Card>
      </Box>
    </Box>
  );
};

export default UIAnalysisTab;

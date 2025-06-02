
import React from 'react';
import { Box, Typography, Grid, Card, CardContent, Chip, CircularProgress, Alert } from '@mui/material';
import { Palette, Type, Image } from 'lucide-react';
import { AnalysisResponse } from '../../hooks/useAnalysisApi';

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

  const { colors, fonts, images } = data.data.ui;

  return (
    <Box>
      <Typography variant="h5" gutterBottom sx={{ fontWeight: 'bold', mb: 3 }}>
        User Interface Analysis
      </Typography>

      <Grid container spacing={3}>
        {/* Color Extraction */}
        <Grid item xs={12} md={6}>
          <Card sx={{ borderRadius: 2, height: '100%' }}>
            <CardContent sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                <Palette size={24} color="#FF6B35" style={{ marginRight: 8 }} />
                <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                  Color Extraction
                </Typography>
              </Box>
              
              <Box>
                {colors.map((color, index) => (
                  <Box key={index} sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <Box
                      sx={{
                        width: 40,
                        height: 40,
                        backgroundColor: color.hex,
                        borderRadius: 1,
                        mr: 2,
                        border: '1px solid rgba(0,0,0,0.1)',
                      }}
                    />
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>
                        {color.name}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {color.hex}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {color.usage}
                      </Typography>
                    </Box>
                  </Box>
                ))}
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Font Analysis */}
        <Grid item xs={12} md={6}>
          <Card sx={{ borderRadius: 2, height: '100%' }}>
            <CardContent sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                <Type size={24} color="#FF6B35" style={{ marginRight: 8 }} />
                <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                  Font Analysis
                </Typography>
              </Box>
              
              <Box>
                {fonts.map((font, index) => (
                  <Box key={index} sx={{ mb: 3, pb: 2, borderBottom: index < fonts.length - 1 ? '1px solid #E0E0E0' : 'none' }}>
                    <Typography variant="h6" sx={{ fontFamily: font.name, mb: 1 }}>
                      {font.name}
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 1, mb: 1, flexWrap: 'wrap' }}>
                      <Chip label={font.category} size="small" variant="outlined" />
                      <Chip label={font.usage} size="small" />
                    </Box>
                    <Typography variant="body2" color="text.secondary">
                      Weight: {font.weight}
                    </Typography>
                  </Box>
                ))}
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Image Analysis */}
        <Grid item xs={12}>
          <Card sx={{ borderRadius: 2 }}>
            <CardContent sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <Image size={24} color="#FF6B35" style={{ marginRight: 8 }} />
                  <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                    Image Analysis
                  </Typography>
                </Box>
                <Typography variant="body2" color="text.secondary">
                  Total: {images.reduce((acc, img) => acc + img.count, 0)} assets
                </Typography>
              </Box>
              
              <Grid container spacing={2}>
                {images.map((imageType, index) => (
                  <Grid item xs={12} sm={6} md={3} key={index}>
                    <Box
                      sx={{
                        p: 2,
                        border: '1px solid #E0E0E0',
                        borderRadius: 2,
                        textAlign: 'center',
                        '&:hover': {
                          backgroundColor: 'rgba(255, 107, 53, 0.05)',
                          cursor: 'pointer',
                        },
                      }}
                    >
                      <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 1 }}>
                        {imageType.count}
                      </Typography>
                      <Typography variant="subtitle2" gutterBottom>
                        {imageType.type}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                        {imageType.format}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {imageType.totalSize}
                      </Typography>
                    </Box>
                  </Grid>
                ))}
              </Grid>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default UIAnalysisTab;

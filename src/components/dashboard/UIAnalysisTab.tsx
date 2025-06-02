
import React from 'react';
import { Box, Typography, Grid, Card, CardContent, Chip } from '@mui/material';
import { Palette, Type, Image, Download } from 'lucide-react';

const UIAnalysisTab = () => {
  const colorPalette = [
    { name: 'Primary', hex: '#FF6B35', usage: 'Headers, CTAs' },
    { name: 'Secondary', hex: '#0984E3', usage: 'Links, Accents' },
    { name: 'Background', hex: '#FFFFFF', usage: 'Main Background' },
    { name: 'Text', hex: '#2D3436', usage: 'Body Text' },
    { name: 'Gray', hex: '#636E72', usage: 'Secondary Text' },
  ];

  const fonts = [
    { name: 'Inter', category: 'Sans-serif', usage: 'Headings', weight: '400, 600, 700' },
    { name: 'Roboto', category: 'Sans-serif', usage: 'Body Text', weight: '300, 400, 500' },
    { name: 'Source Code Pro', category: 'Monospace', usage: 'Code Blocks', weight: '400, 500' },
  ];

  const images = [
    { type: 'Logo', count: 3, format: 'SVG, PNG', totalSize: '45KB' },
    { type: 'Icons', count: 24, format: 'SVG', totalSize: '128KB' },
    { type: 'Photos', count: 8, format: 'JPG, WebP', totalSize: '2.4MB' },
    { type: 'Graphics', count: 12, format: 'PNG, SVG', totalSize: '890KB' },
  ];

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
                {colorPalette.map((color, index) => (
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
                      Weights: {font.weight}
                    </Typography>
                  </Box>
                ))}
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Image Gallery */}
        <Grid item xs={12}>
          <Card sx={{ borderRadius: 2 }}>
            <CardContent sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <Image size={24} color="#FF6B35" style={{ marginRight: 8 }} />
                  <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                    Image Gallery
                  </Typography>
                </Box>
                <Typography variant="body2" color="text.secondary">
                  Total: 47 assets (3.4MB)
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
                      <Box sx={{ mt: 1 }}>
                        <Download size={16} color="#757575" />
                      </Box>
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

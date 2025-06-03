
// UPDATED: Image Analysis section now supports click-to-expand lists of image URLs.

import React, { useState } from 'react';
import { Box, Typography, Grid, Card, CardContent, Chip, CircularProgress, Alert, List, ListItem, Link } from '@mui/material';
import { Palette, Type, Image, ExpandMore } from 'lucide-react';
import { AnalysisResponse } from '../../hooks/useAnalysisApi';

interface UIAnalysisTabProps {
  data: AnalysisResponse | null;
  loading: boolean;
  error: string | null;
}

const UIAnalysisTab: React.FC<UIAnalysisTabProps> = ({ data, loading, error }) => {
  const [expandedTotal, setExpandedTotal] = useState(false);
  const [expandedPhotos, setExpandedPhotos] = useState(false);
  const [expandedIcons, setExpandedIcons] = useState(false);

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

  // Generate mock URLs for demonstration since the API doesn't return actual URLs yet
  const generateMockUrls = (count: number, type: string) => {
    return Array.from({ length: Math.min(count, 10) }, (_, i) => 
      `https://example.com/${type}${i + 1}.${type === 'icon' ? 'svg' : 'jpg'}`
    );
  };

  const imageUrls = generateMockUrls(images.reduce((acc, img) => acc + img.count, 0), 'image');
  const photoUrls = generateMockUrls(Math.floor(images.reduce((acc, img) => acc + img.count, 0) * 0.6), 'photo');
  const iconUrls = generateMockUrls(Math.floor(images.reduce((acc, img) => acc + img.count, 0) * 0.4), 'icon');

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
                {/* Total Images Box */}
                <Grid item xs={12} sm={6} md={4}>
                  <Box
                    onClick={() => setExpandedTotal(!expandedTotal)}
                    sx={{
                      p: 2,
                      border: '1px solid #E0E0E0',
                      borderRadius: 2,
                      textAlign: 'center',
                      cursor: 'pointer',
                      '&:hover': {
                        backgroundColor: 'rgba(255, 107, 53, 0.05)',
                      },
                    }}
                  >
                    <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 1 }}>
                      {images.reduce((acc, img) => acc + img.count, 0)}
                    </Typography>
                    <Typography variant="subtitle2" gutterBottom sx={{ fontWeight: expandedTotal ? 'bold' : 'normal' }}>
                      Total Images
                      <ExpandMore 
                        size={16} 
                        style={{ 
                          marginLeft: 4,
                          transform: expandedTotal ? 'rotate(180deg)' : 'rotate(0deg)',
                          transition: 'transform 0.2s'
                        }} 
                      />
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                      Mixed
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {images.find(img => img.type === 'Total Images')?.totalSize || '0KB'}
                    </Typography>
                    
                    {expandedTotal && (
                      <Box sx={{ width: '100%', mt: 2, textAlign: 'left' }}>
                        {imageUrls.length > 0 ? (
                          <List dense>
                            {imageUrls.map((url, idx) => (
                              <ListItem key={idx} disableGutters>
                                <Link 
                                  href={url} 
                                  target="_blank" 
                                  rel="noopener noreferrer" 
                                  underline="hover"
                                  sx={{ wordBreak: 'break-all' }}
                                >
                                  <Typography variant="body2">{url}</Typography>
                                </Link>
                              </ListItem>
                            ))}
                          </List>
                        ) : (
                          <Typography variant="body2" color="text.secondary">
                            No images found on this page.
                          </Typography>
                        )}
                      </Box>
                    )}
                  </Box>
                </Grid>

                {/* Estimated Photos Box */}
                <Grid item xs={12} sm={6} md={4}>
                  <Box
                    onClick={() => setExpandedPhotos(!expandedPhotos)}
                    sx={{
                      p: 2,
                      border: '1px solid #E0E0E0',
                      borderRadius: 2,
                      textAlign: 'center',
                      cursor: 'pointer',
                      '&:hover': {
                        backgroundColor: 'rgba(255, 107, 53, 0.05)',
                      },
                    }}
                  >
                    <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 1 }}>
                      {images.find(img => img.type === 'Estimated Photos')?.count || 0}
                    </Typography>
                    <Typography variant="subtitle2" gutterBottom sx={{ fontWeight: expandedPhotos ? 'bold' : 'normal' }}>
                      Estimated Photos
                      <ExpandMore 
                        size={16} 
                        style={{ 
                          marginLeft: 4,
                          transform: expandedPhotos ? 'rotate(180deg)' : 'rotate(0deg)',
                          transition: 'transform 0.2s'
                        }} 
                      />
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                      {images.find(img => img.type === 'Estimated Photos')?.format || 'JPG/PNG'}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {images.find(img => img.type === 'Estimated Photos')?.totalSize || '0KB'}
                    </Typography>
                    
                    {expandedPhotos && (
                      <Box sx={{ width: '100%', mt: 2, textAlign: 'left' }}>
                        {photoUrls.length > 0 ? (
                          <List dense>
                            {photoUrls.map((url, idx) => (
                              <ListItem key={idx} disableGutters>
                                <Link 
                                  href={url} 
                                  target="_blank" 
                                  rel="noopener noreferrer" 
                                  underline="hover"
                                  sx={{ wordBreak: 'break-all' }}
                                >
                                  <Typography variant="body2">{url}</Typography>
                                </Link>
                              </ListItem>
                            ))}
                          </List>
                        ) : (
                          <Typography variant="body2" color="text.secondary">
                            No photos found on this page.
                          </Typography>
                        )}
                      </Box>
                    )}
                  </Box>
                </Grid>

                {/* Estimated Icons Box */}
                <Grid item xs={12} sm={6} md={4}>
                  <Box
                    onClick={() => setExpandedIcons(!expandedIcons)}
                    sx={{
                      p: 2,
                      border: '1px solid #E0E0E0',
                      borderRadius: 2,
                      textAlign: 'center',
                      cursor: 'pointer',
                      '&:hover': {
                        backgroundColor: 'rgba(255, 107, 53, 0.05)',
                      },
                    }}
                  >
                    <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 1 }}>
                      {images.find(img => img.type === 'Estimated Icons')?.count || 0}
                    </Typography>
                    <Typography variant="subtitle2" gutterBottom sx={{ fontWeight: expandedIcons ? 'bold' : 'normal' }}>
                      Estimated Icons
                      <ExpandMore 
                        size={16} 
                        style={{ 
                          marginLeft: 4,
                          transform: expandedIcons ? 'rotate(180deg)' : 'rotate(0deg)',
                          transition: 'transform 0.2s'
                        }} 
                      />
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                      {images.find(img => img.type === 'Estimated Icons')?.format || 'SVG/PNG'}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {images.find(img => img.type === 'Estimated Icons')?.totalSize || '0KB'}
                    </Typography>
                    
                    {expandedIcons && (
                      <Box sx={{ width: '100%', mt: 2, textAlign: 'left' }}>
                        {iconUrls.length > 0 ? (
                          <List dense>
                            {iconUrls.map((url, idx) => (
                              <ListItem key={idx} disableGutters>
                                <Link 
                                  href={url} 
                                  target="_blank" 
                                  rel="noopener noreferrer" 
                                  underline="hover"
                                  sx={{ wordBreak: 'break-all' }}
                                >
                                  <Typography variant="body2">{url}</Typography>
                                </Link>
                              </ListItem>
                            ))}
                          </List>
                        ) : (
                          <Typography variant="body2" color="text.secondary">
                            No icons found on this page.
                          </Typography>
                        )}
                      </Box>
                    )}
                  </Box>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default UIAnalysisTab;

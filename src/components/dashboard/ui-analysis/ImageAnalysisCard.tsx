
import React, { useState } from 'react';
import { Box, Typography, Grid, Card, CardContent } from '@mui/material';
import { Image } from 'lucide-react';
import { AnalysisResponse } from '../../../hooks/useAnalysisApi';
import ExpandableImageBox from './ExpandableImageBox';

interface ImageAnalysisCardProps {
  images: AnalysisResponse['data']['ui']['images'];
}

const ImageAnalysisCard: React.FC<ImageAnalysisCardProps> = ({ images }) => {
  const [expandedTotal, setExpandedTotal] = useState(false);
  const [expandedPhotos, setExpandedPhotos] = useState(false);
  const [expandedIcons, setExpandedIcons] = useState(false);

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
            <ExpandableImageBox
              title="Total Images"
              count={images.reduce((acc, img) => acc + img.count, 0)}
              format="Mixed"
              totalSize={images.find(img => img.type === 'Total Images')?.totalSize || '0KB'}
              isExpanded={expandedTotal}
              onToggle={() => setExpandedTotal(!expandedTotal)}
              urls={imageUrls}
              emptyMessage="No images found on this page."
            />
          </Grid>

          {/* Estimated Photos Box */}
          <Grid item xs={12} sm={6} md={4}>
            <ExpandableImageBox
              title="Estimated Photos"
              count={images.find(img => img.type === 'Estimated Photos')?.count || 0}
              format={images.find(img => img.type === 'Estimated Photos')?.format || 'JPG/PNG'}
              totalSize={images.find(img => img.type === 'Estimated Photos')?.totalSize || '0KB'}
              isExpanded={expandedPhotos}
              onToggle={() => setExpandedPhotos(!expandedPhotos)}
              urls={photoUrls}
              emptyMessage="No photos found on this page."
            />
          </Grid>

          {/* Estimated Icons Box */}
          <Grid item xs={12} sm={6} md={4}>
            <ExpandableImageBox
              title="Estimated Icons"
              count={images.find(img => img.type === 'Estimated Icons')?.count || 0}
              format={images.find(img => img.type === 'Estimated Icons')?.format || 'SVG/PNG'}
              totalSize={images.find(img => img.type === 'Estimated Icons')?.totalSize || '0KB'}
              isExpanded={expandedIcons}
              onToggle={() => setExpandedIcons(!expandedIcons)}
              urls={iconUrls}
              emptyMessage="No icons found on this page."
            />
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );
};

export default ImageAnalysisCard;

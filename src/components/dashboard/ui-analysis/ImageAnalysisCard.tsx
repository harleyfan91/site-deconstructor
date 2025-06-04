
import React, { useState } from 'react';
import { Box, Typography, Grid, Card, CardContent } from '@mui/material';
import { Image } from 'lucide-react';
import { AnalysisResponse } from '../../../hooks/useAnalysisApi';
import ExpandableImageBox from './ExpandableImageBox';

interface ImageAnalysisCardProps {
  images: AnalysisResponse['data']['ui']['images'];
  imageAnalysis?: {
    totalImages: number;
    estimatedPhotos: number;
    estimatedIcons: number;
    imageUrls: string[];
    photoUrls: string[];
    iconUrls: string[];
  };
}

const ImageAnalysisCard: React.FC<ImageAnalysisCardProps> = ({ images, imageAnalysis }) => {
  const [expandedTotal, setExpandedTotal] = useState(false);
  const [expandedPhotos, setExpandedPhotos] = useState(false);
  const [expandedIcons, setExpandedIcons] = useState(false);

  // Debug logging
  console.log('ImageAnalysisCard received imageAnalysis:', imageAnalysis);
  console.log('ImageAnalysisCard received images:', images);

  // Use real scraped URLs, make sure they're arrays even if undefined
  const imageUrls = imageAnalysis?.imageUrls || [];
  const photoUrls = imageAnalysis?.photoUrls || [];
  const iconUrls = imageAnalysis?.iconUrls || [];

  console.log('Processed URLs:', { imageUrls: imageUrls.length, photoUrls: photoUrls.length, iconUrls: iconUrls.length });

  const totalImagesCount = imageAnalysis?.totalImages || images.reduce((acc, img) => acc + img.count, 0);
  const photosCount = imageAnalysis?.estimatedPhotos || images.find(img => img.type === 'Estimated Photos')?.count || 0;
  const iconsCount = imageAnalysis?.estimatedIcons || images.find(img => img.type === 'Estimated Icons')?.count || 0;

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
            Total: {totalImagesCount} assets
          </Typography>
        </Box>
        
        <Grid container spacing={2}>
          {/* Total Images Box */}
          <Grid item xs={12} sm={6} md={4}>
            <ExpandableImageBox
              title="Total Images"
              count={totalImagesCount}
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
              count={photosCount}
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
              count={iconsCount}
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

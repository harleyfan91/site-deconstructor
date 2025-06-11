
import React, { useState } from 'react';
import { Box, Typography, List, ListItem, Link, Collapse, IconButton } from '@mui/material';
import { Image, ChevronDown, ChevronUp } from 'lucide-react';
import type { AnalysisResponse } from '@/types/analysis';

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
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    total: false,
    photos: false,
    icons: false
  });

  const toggleSection = (name: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [name]: !prev[name]
    }));
  };


  // Use real scraped URLs, make sure they're arrays even if undefined
  const imageUrls = imageAnalysis?.imageUrls || [];
  const photoUrls = imageAnalysis?.photoUrls || [];
  const iconUrls = imageAnalysis?.iconUrls || [];

  const truncateUrl = (url: string, length = 50) =>
    url.length > length ? `${url.slice(0, length)}[...]` : url;


  const totalImagesCount = imageAnalysis?.totalImages || images.reduce((acc, img) => acc + img.count, 0);
  const photosCount = imageAnalysis?.estimatedPhotos || images.find(img => img.type === 'Estimated Photos')?.count || 0;
  const iconsCount = imageAnalysis?.estimatedIcons || images.find(img => img.type === 'Estimated Icons')?.count || 0;

  return (
    <Box>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
          <Image size={24} color="#FF6B35" style={{ marginRight: 8 }} />
          <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
            Image Analysis
          </Typography>
        </Box>

        <Box>
          {[
            { key: 'total', title: 'Total Images', count: totalImagesCount, urls: imageUrls, empty: 'No images found on this page.' },
            { key: 'photos', title: 'Estimated Photos', count: photosCount, urls: photoUrls, empty: 'No photos found on this page.' },
            { key: 'icons', title: 'Estimated Icons', count: iconsCount, urls: iconUrls, empty: 'No icons found on this page.' }
          ].map(section => (
            <Box key={section.key} sx={{ mb: 2 }}>
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  cursor: 'pointer',
                  p: 1,
                  borderRadius: 1,
                  bgcolor: 'rgba(255, 107, 53, 0.05)',
                  '&:hover': {
                    bgcolor: 'rgba(255, 107, 53, 0.1)',
                  },
                }}
                onClick={() => toggleSection(section.key)}
              >
                <Typography variant="subtitle1" sx={{ fontWeight: 'bold', color: '#FF6B35' }}>
                  {section.title} ({section.count})
                </Typography>
                <IconButton size="small">
                  {expandedSections[section.key] ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                </IconButton>
              </Box>

              <Collapse in={expandedSections[section.key]}>
                <Box sx={{ mt: 2, ml: 2 }}>
                  {section.urls && section.urls.length > 0 ? (
                    <List dense>
                      {section.urls.map((url, idx) => (
                        <ListItem key={idx} disableGutters>
                          <Link
                            href={url}
                            target="_blank"
                            rel="noopener noreferrer"
                            underline="hover"
                            title={url}
                            sx={{ maxWidth: '100%' }}
                          >
                            <Typography
                              variant="body2"
                              sx={{
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                whiteSpace: 'nowrap',
                                maxWidth: '100%',
                                display: 'block'
                              }}
                            >
                              {truncateUrl(url)}
                            </Typography>
                          </Link>
                        </ListItem>
                      ))}
                    </List>
                  ) : (
                    <Typography variant="body2" color="text.secondary">
                      {section.empty}
                    </Typography>
                  )}
                </Box>
              </Collapse>
            </Box>
          ))}
        </Box>
    </Box>
  );
};

export default ImageAnalysisCard;

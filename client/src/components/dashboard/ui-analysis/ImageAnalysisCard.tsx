
import React, { useEffect, useRef, useState } from 'react';
import { Box, Typography, List, ListItem, Link, Collapse, IconButton } from '@mui/material';
import { Image, ChevronDown, ChevronUp } from 'lucide-react';
import type { AnalysisResponse } from '@/types/analysis';
import { useSessionState } from '@/hooks/useSessionState';

interface ImageAnalysisCardProps {
  images: Array<{url: string, alt?: string, type?: string}>;
  imageAnalysis?: {
    totalImages: number;
    estimatedPhotos: number;
    estimatedIcons: number;
    imageUrls?: string[];
    photoUrls?: string[];
    iconUrls?: string[];
  };
}

interface AdaptiveLinkProps {
  url: string;
  index: number;
}

const AdaptiveLink: React.FC<AdaptiveLinkProps> = ({ url, index }) => {
  const [displayUrl, setDisplayUrl] = useState(url);
  const textRef = useRef<HTMLAnchorElement>(null);

  useEffect(() => {
    const el = textRef.current;
    if (!el) return;

    const updateDisplay = () => {
      if (!el) return;
      el.textContent = url;
      if (el.scrollWidth <= el.clientWidth) {
        if (displayUrl !== url) {
          setDisplayUrl(url);
        }
        return;
      }

      let start = 0;
      let end = url.length;
      let truncated = url;

      while (start < end) {
        const mid = Math.floor((start + end) / 2);
        const candidate = `${url.slice(0, mid)}...`;
        el.textContent = candidate;
        if (el.scrollWidth <= el.clientWidth) {
          truncated = candidate;
          start = mid + 1;
        } else {
          end = mid;
        }
      }

      if (displayUrl !== truncated) {
        setDisplayUrl(truncated);
      }
    };

    updateDisplay();
    window.addEventListener('resize', updateDisplay);
    return () => {
      window.removeEventListener('resize', updateDisplay);
    };
  }, [url, displayUrl]);

  return (
    <Link
      ref={textRef}
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      underline="hover"
      title={url}
      sx={{ 
        maxWidth: '100%',
        overflow: 'hidden',
        whiteSpace: 'nowrap',
        fontSize: '0.875rem',
        minWidth: 0,
        display: 'block'
      }}
    >
      {displayUrl}
    </Link>
  );
};

const ImageAnalysisCard: React.FC<ImageAnalysisCardProps> = ({ images, imageAnalysis }) => {
  const [expandedSections, setExpandedSections] = useSessionState<Record<string, boolean>>(
    'ui-image-analysis-expanded',
    {
      total: false,
      photos: false,
      icons: false
    }
  );

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

  const totalImagesCount = imageAnalysis?.totalImages || images?.length || 0;
  const photosCount = imageAnalysis?.estimatedPhotos || 0;
  const iconsCount = imageAnalysis?.estimatedIcons || 0;

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
                      {section.urls.map((url: string, idx: number) => (
                        <ListItem key={idx} disableGutters sx={{ py: 0.5, minWidth: 0 }}>
                          <AdaptiveLink url={url} index={idx} />
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

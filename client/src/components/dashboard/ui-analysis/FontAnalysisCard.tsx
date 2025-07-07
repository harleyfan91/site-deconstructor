
import React, { useState, useEffect, useRef } from 'react';
import { Box, Typography, Chip, CircularProgress } from '@mui/material';
import { Type } from 'lucide-react';
import type { AnalysisResponse } from '@/types/analysis';

interface FontAnalysisCardProps {
  fonts?: Array<{name: string, category: string, usage: string, weight?: string, isLoaded?: boolean, isPublic?: boolean}>;
  url?: string;
}

const FontAnalysisCard: React.FC<FontAnalysisCardProps> = ({ fonts: propFonts, url }) => {
  const [fonts, setFonts] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showScrollIndicator, setShowScrollIndicator] = useState(false);
  const [canScroll, setCanScroll] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const scrollTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Check if content is scrollable
  const checkScrollable = () => {
    const element = scrollRef.current;
    if (element) {
      const isScrollable = element.scrollHeight > element.clientHeight;
      setCanScroll(isScrollable);
    }
  };

  // Handle scroll events
  const handleScroll = () => {
    setShowScrollIndicator(true);
    
    // Clear existing timeout
    if (scrollTimeoutRef.current) {
      clearTimeout(scrollTimeoutRef.current);
    }
    
    // Hide indicator after scroll stops
    scrollTimeoutRef.current = setTimeout(() => {
      setShowScrollIndicator(false);
    }, 1500);
  };

  useEffect(() => {
    if (!url) return;
    
    const fetchFonts = async () => {
      setLoading(true);
      setError(null);
      
      try {
        const response = await fetch('/api/fonts', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ url })
        });
        
        if (!response.ok) {
          throw new Error(`Failed to fetch fonts: ${response.status}`);
        }
        
        const fontData = await response.json();
        setFonts(fontData);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to extract fonts');
        console.error('Font extraction error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchFonts();
  }, [url]);

  // Check scrollable after fonts load
  useEffect(() => {
    if (fonts.length > 0) {
      setTimeout(checkScrollable, 100);
    }
  }, [fonts]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }
    };
  }, []);

  // Use fetched font data or fallback to props
  const fontsToDisplay = fonts.length > 0 ? fonts : (propFonts || []);

  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
        <Type size={24} color="#FF6B35" style={{ marginRight: 8 }} />
        <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
          Font Analysis
        </Typography>

      </Box>
      
      <Box>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', py: 3 }}>
            <CircularProgress size={24} sx={{ mr: 2 }} />
            <Typography variant="body2" color="text.secondary">
              Extracting fonts...
            </Typography>
          </Box>
        ) : error ? (
          <Typography variant="body2" color="error" sx={{ fontStyle: 'italic', textAlign: 'center', py: 3 }}>
            {error}
          </Typography>
        ) : fontsToDisplay.length === 0 ? (
          <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic', textAlign: 'center', py: 3 }}>
            No fonts detected for this website.
          </Typography>
        ) : (
          <Box sx={{ position: 'relative' }}>
            <Box 
              ref={scrollRef}
              onScroll={handleScroll}
              sx={{ 
                maxHeight: { xs: '200px', md: '300px' }, // 2 fonts mobile, 3 fonts desktop (~100px per font)
                overflowY: 'auto',
                overflowX: 'hidden',
                pr: 1,
                // Hide scrollbar completely
                '&::-webkit-scrollbar': {
                  display: 'none',
                },
                scrollbarWidth: 'none', // Firefox
                msOverflowStyle: 'none', // IE/Edge
              }}
            >
              {fontsToDisplay.map((font: any, index: number) => (
                <Box key={index} sx={{ mb: 3, pb: 2, borderBottom: index < fontsToDisplay.length - 1 ? '1px solid #E0E0E0' : 'none' }}>
                  <Typography variant="h6" sx={{ fontFamily: font.name, mb: 1 }}>
                    {font.name}
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 1, mb: 1, flexWrap: 'wrap' }}>
                    <Chip label={font.category} size="small" variant="outlined" />
                    <Chip label={font.usage} size="small" />
                    {'isLoaded' in font && (
                      <Chip 
                        label={font.isLoaded ? 'loaded' : 'not loaded'} 
                        size="small" 
                        color={font.isLoaded ? 'success' : 'error'}
                        variant="outlined"
                      />
                    )}
                    {'isPublic' in font && font.isPublic && (
                      <Chip label="Public Font" size="small" color="info" variant="outlined" />
                    )}
                  </Box>
                  <Typography variant="body2" color="text.secondary">
                    Weight: {font.weight}
                  </Typography>
                </Box>
              ))}
            </Box>
            {/* Universal scroll indicator - shows when scrolling and content is scrollable */}
            {canScroll && showScrollIndicator && (
              <Box
                sx={{
                  position: 'absolute',
                  bottom: 6,
                  right: 6,
                  zIndex: 10,
                  transition: 'opacity 2s cubic-bezier(0.4, 0, 0.2, 1)',
                  opacity: showScrollIndicator ? 1 : 0,
                }}
              >
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 0.5,
                    px: 1,
                    py: 0.5,
                    borderRadius: '12px',
                    backgroundColor: 'rgba(0,0,0,0.75)',
                    color: 'white',
                    backdropFilter: 'blur(4px)',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
                  }}
                >
                  <Typography 
                    variant="caption" 
                    sx={{ 
                      fontSize: '10px',
                      fontWeight: 500,
                    }}
                  >
                    Scroll for more
                  </Typography>
                  <Box
                    sx={{
                      width: '10px',
                      height: '10px',
                      borderRadius: '50%',
                      backgroundColor: 'white',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'black',
                      fontSize: '6px',
                    }}
                  >
                    ↓
                  </Box>
                </Box>
              </Box>
            )}
          </Box>
        )}
      </Box>
    </Box>
  );
};

export default FontAnalysisCard;

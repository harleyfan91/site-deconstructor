
import React, { useState, useEffect } from 'react';
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
              sx={{ 
                maxHeight: { xs: '200px', md: '300px' }, // 2 fonts mobile, 3 fonts desktop (~100px per font)
                overflowY: 'auto',
                overflowX: 'hidden',
                pr: 2, // Add padding for scrollbar
                '&::-webkit-scrollbar': {
                  width: '4px',
                },
                '&::-webkit-scrollbar-track': {
                  background: '#f1f1f1',
                  borderRadius: '3px',
                },
                '&::-webkit-scrollbar-thumb': {
                  background: '#b3b3b3',
                  borderRadius: '3px',
                  '&:hover': {
                    background: '#8c8c8c',
                  },
                },
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
            {/* Scroll indicator for mobile - only show if there are more than 2 fonts */}
            {fontsToDisplay.length > 2 && (
              <Box
                sx={{
                  display: { xs: 'flex', md: 'none' }, // Only show on mobile
                  justifyContent: 'center',
                  alignItems: 'center',
                  mt: 1,
                  py: 0.5,
                  borderTop: '1px solid #E0E0E0',
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
                    backgroundColor: 'rgba(0,0,0,0.05)',
                    border: '1px solid rgba(0,0,0,0.1)',
                  }}
                >
                  <Typography 
                    variant="caption" 
                    sx={{ 
                      color: 'text.secondary',
                      fontSize: '10px',
                      fontWeight: 500,
                    }}
                  >
                    Scroll for more
                  </Typography>
                  <Box
                    sx={{
                      width: '12px',
                      height: '12px',
                      borderRadius: '50%',
                      backgroundColor: 'primary.main',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'white',
                      fontSize: '8px',
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

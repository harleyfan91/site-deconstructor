
import React, { useEffect, useState } from 'react';
import { Box, Typography, Chip, CircularProgress } from '@mui/material';
import { Type } from 'lucide-react';

interface FontAnalysisCardProps {
  url?: string;
}

const FontAnalysisCard: React.FC<FontAnalysisCardProps> = ({ url }) => {
  const [fonts, setFonts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!url) return;

    const fetchFonts = async () => {
      setIsLoading(true);
      try {
        const response = await fetch('/api/fonts', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ url })
        });
        
        if (response.ok) {
          const fontData = await response.json();
          setFonts(fontData);
        }
      } catch (error) {
        console.error('Font analysis failed:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchFonts();
  }, [url]);

  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
        <Type size={24} color="#FF6B35" style={{ marginRight: 8 }} />
        <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
          Font Analysis
        </Typography>
        {isLoading && <CircularProgress size={16} sx={{ ml: 2 }} />}
      </Box>
      
      <Box>
        {fonts.map((font: any, index: number) => (
          <Box key={index} sx={{ mb: 3, pb: 2, borderBottom: index < fonts.length - 1 ? '1px solid #E0E0E0' : 'none' }}>
            <Typography variant="h6" sx={{ fontFamily: font.name, mb: 1 }}>
              {font.name}
            </Typography>
            <Box sx={{ display: 'flex', gap: 1, mb: 1, flexWrap: 'wrap' }}>
              <Chip label={font.category} size="small" variant="outlined" />
              <Chip label={font.usage} size="small" />
              <Chip 
                label={font.isLoaded ? 'loaded' : 'not loaded'} 
                size="small" 
                color={font.isLoaded ? 'success' : 'error'}
                variant="outlined"
              />
              {font.isPublic && (
                <Chip label="Public Font" size="small" color="info" variant="outlined" />
              )}
            </Box>
            <Typography variant="body2" color="text.secondary">
              Weight: {font.weight}
            </Typography>
          </Box>
        ))}
      </Box>
    </Box>
  );
};

export default FontAnalysisCard;


import React, { useEffect, useState } from 'react';
import { Box, Typography, Chip, CircularProgress } from '@mui/material';
import { Type } from 'lucide-react';
import type { AnalysisResponse } from '@/types/analysis';
import { analyzeFontsOnPage, FontAnalysisResult } from '@/utils/fontAnalysis';

interface FontAnalysisCardProps {
  fonts: Array<{name: string, category: string, usage: string, weight?: string, isLoaded?: boolean, isPublic?: boolean}>;
}

const FontAnalysisCard: React.FC<FontAnalysisCardProps> = ({ fonts: propFonts }) => {
  const [analyzedFonts, setAnalyzedFonts] = useState<FontAnalysisResult[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  useEffect(() => {
    const performFontAnalysis = async () => {
      setIsAnalyzing(true);
      try {
        const results = await analyzeFontsOnPage();
        setAnalyzedFonts(results);
      } catch (error) {
        console.error('Font analysis failed:', error);
        // Fallback to prop fonts if analysis fails
        setAnalyzedFonts([]);
      } finally {
        setIsAnalyzing(false);
      }
    };

    performFontAnalysis();
  }, []);

  // Only use real analyzed fonts - no fallback to potentially incorrect prop fonts
  const fontsToDisplay = analyzedFonts;

  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
        <Type size={24} color="#FF6B35" style={{ marginRight: 8 }} />
        <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
          Font Analysis
        </Typography>
        {isAnalyzing && (
          <CircularProgress size={16} sx={{ ml: 2 }} />
        )}
      </Box>
      
      <Box>
        {fontsToDisplay.length === 0 ? (
          <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic', textAlign: 'center', py: 3 }}>
            Font extraction is currently unavailable. Browser analysis requires Chromium to be installed.
          </Typography>
        ) : (
          fontsToDisplay.map((font: any, index: number) => (
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
          ))
        )}
      </Box>
    </Box>
  );
};

export default FontAnalysisCard;

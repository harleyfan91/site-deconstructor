
import React, { useEffect, useState } from 'react';
import { Box, Typography, Chip, CircularProgress } from '@mui/material';
import { Type } from 'lucide-react';
import type { AnalysisResponse } from '@/types/analysis';
import { analyzeFontsOnPage, FontAnalysisResult } from '@/utils/fontAnalysis';

interface FontAnalysisCardProps {
  fonts: AnalysisResponse['data']['ui']['fonts'];
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

  // Use analyzed fonts if available, otherwise fall back to prop fonts
  const fontsToDisplay = analyzedFonts.length > 0 ? analyzedFonts : propFonts;

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
        {fontsToDisplay.map((font, index) => (
          <Box key={index} sx={{ mb: 3, pb: 2, borderBottom: index < fontsToDisplay.length - 1 ? '1px solid #E0E0E0' : 'none' }}>
            <Typography variant="h6" sx={{ fontFamily: font.name, mb: 1 }}>
              {font.name}
            </Typography>
            <Box sx={{ display: 'flex', gap: 1, mb: 1, flexWrap: 'wrap' }}>
              <Chip label={font.category} size="small" variant="outlined" />
              <Chip label={font.usage} size="small" />
              {'isLoaded' in font && (
                <Chip 
                  label={font.isLoaded ? 'Loaded' : 'Not Loaded'} 
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
    </Box>
  );
};

export default FontAnalysisCard;

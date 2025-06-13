
import React from 'react';
import { Box, Typography, Chip } from '@mui/material';
import { Type } from 'lucide-react';
import type { AnalysisResponse } from '@/types/analysis';

interface FontAnalysisCardProps {
  fonts: AnalysisResponse['data']['ui']['fonts'];
}

const FontAnalysisCard: React.FC<FontAnalysisCardProps> = ({ fonts }) => {
  return (
    <Box>
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
    </Box>
  );
};

export default FontAnalysisCard;

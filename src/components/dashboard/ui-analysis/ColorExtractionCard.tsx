
import React from 'react';
import { Box, Typography, Card, CardContent } from '@mui/material';
import { Palette } from 'lucide-react';
import type { AnalysisResponse } from '@/types/analysis';

interface ColorExtractionCardProps {
  colors: AnalysisResponse['data']['ui']['colors'];
}

const ColorExtractionCard: React.FC<ColorExtractionCardProps> = ({ colors }) => {
  return (
    <Card sx={{ borderRadius: 2, height: '100%' }}>
      <CardContent sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
          <Palette size={24} color="#FF6B35" style={{ marginRight: 8 }} />
          <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
            Color Extraction
          </Typography>
        </Box>
        
        <Box>
          {colors.map((color, index) => (
            <Box key={index} sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <Box
                sx={{
                  width: 40,
                  height: 40,
                  backgroundColor: color.hex,
                  borderRadius: 1,
                  mr: 2,
                  border: '1px solid rgba(0,0,0,0.1)',
                }}
              />
              <Box sx={{ flex: 1 }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>
                  {color.name}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {color.hex}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {color.usage}
                </Typography>
              </Box>
            </Box>
          ))}
        </Box>
      </CardContent>
    </Card>
  );
};

export default ColorExtractionCard;

import React from 'react';
import { Box, Typography } from '@mui/material';
import { Shield } from 'lucide-react';

interface AccessibilityCardProps {
  url?: string;
}

const AccessibilityCard: React.FC<AccessibilityCardProps> = ({ url }) => {
  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
        <Shield size={24} style={{ marginRight: 8, color: '#FF6B35' }} />
        <Typography variant="h6">
          Accessibility & Contrast
        </Typography>
      </Box>

      {/* TODO: re-inject content once backend refactor lands */}
      
    </Box>
  );
};

export default AccessibilityCard;
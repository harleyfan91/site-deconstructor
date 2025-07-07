
import React from 'react';
import { Box, Typography, Popover } from '@mui/material';

interface MetricInfoPopoverProps {
  anchorEl: HTMLElement | null;
  infoText: string | null;
  onClose: () => void;
}

const MetricInfoPopover: React.FC<MetricInfoPopoverProps> = ({ anchorEl, infoText, onClose }) => (
  <Popover
    open={Boolean(anchorEl)}
    anchorEl={anchorEl}
    onClose={onClose}
    anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
    transformOrigin={{ vertical: 'top', horizontal: 'center' }}
  >
    <Box sx={{ p: 2, maxWidth: 250 }}>
      <Typography variant="body2">
        {infoText || "!"}
      </Typography>
    </Box>
  </Popover>
);

export default MetricInfoPopover;

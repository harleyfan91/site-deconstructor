
import React from 'react';
import { Box, Typography, IconButton, Popover, Paper } from '@mui/material';
// Using the allowed lucide-react icon for accessibility label
import { Circle } from 'lucide-react';

const COLORS = [
  { color: '#BDBDBD', label: 'Gray', meaning: 'No data / Neutral / Missing' },
  { color: '#4CAF50', label: 'Green', meaning: 'Good / Pass / No issues detected' },
  { color: '#FFEB3B', label: 'Yellow', meaning: 'Warning / Needs attention' },
  { color: '#F44336', label: 'Red', meaning: 'Critical / Failing / Immediate action required' },
];

export default function ColorLegend() {
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);

  const handleOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => setAnchorEl(null);

  const open = Boolean(anchorEl);

  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
      {/* Circles */}
      {COLORS.map((item) => (
        <Box
          key={item.label}
          sx={{
            border: `2px solid ${item.color}`,
            borderRadius: '50%',
            width: 20,
            height: 20,
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: 'transparent',
            mr: 0.5,
            boxSizing: 'border-box'
          }}
        >
          {/* Using a visually hidden Circle icon for a11y, but the circle is just border */}
          <Circle size={14} color="transparent" aria-label={item.label} style={{ visibility: 'hidden' }} />
        </Box>
      ))}
      <IconButton
        onClick={handleOpen}
        onMouseEnter={handleOpen}
        onMouseLeave={handleClose}
        size="small"
        sx={{
          px: 1,
          color: 'inherit',
        }}
        aria-label="Show legend details"
      >
        <Typography component="span" fontSize="0.98rem" fontWeight={600}>
          Legend
        </Typography>
      </IconButton>
      <Popover
        open={open}
        anchorEl={anchorEl}
        onClose={handleClose}
        disableRestoreFocus
        anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
        transformOrigin={{ vertical: 'top', horizontal: 'left' }}
        PaperProps={{ sx: { p: 1.5, minWidth: 220, boxShadow: 6 } }}
        // Show popover on hover on desktop, click on mobile
        onMouseEnter={handleOpen}
        onMouseLeave={handleClose}
      >
        <Paper elevation={0} sx={{ background: '#23272E', color: '#fff', p: 1, borderRadius: 2 }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mb: 0.5 }}>
            Legend
          </Typography>
          {COLORS.map(c => (
            <Box key={c.label} sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
              <Box
                sx={{
                  border: `2px solid ${c.color}`,
                  borderRadius: '50%',
                  width: 15,
                  height: 15,
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  mr: 1,
                  backgroundColor: 'transparent',
                }}
              />
              <Typography variant="body2" sx={{ fontWeight: 500 }}>{c.meaning}</Typography>
            </Box>
          ))}
        </Paper>
      </Popover>
    </Box>
  );
}

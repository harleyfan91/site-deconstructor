
import React from 'react';
import { Card, CardContent, Typography, Box, Popover, useMediaQuery } from '@mui/material';
import { Circle } from 'lucide-react';
import { useTheme } from '@mui/material/styles';

const LEGEND_COLORS = [
  { color: '#BDBDBD', key: 'gray', label: 'Unknown/Not detected' },
  { color: '#43A047', key: 'green1', label: 'Good / Secure / Passing' },
  { color: '#FFB300', key: 'orange', label: 'Warning / Needs improvement' },
  { color: '#F44336', key: 'red', label: 'Critical issue / Failing' }
];

const LegendContainer: React.FC = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);

  // Desktop: Show on hover; Mobile: Toggle on click
  const handleOpen = (event: React.MouseEvent<HTMLElement>) => {
    if (isMobile) {
      setAnchorEl(anchorEl ? null : event.currentTarget);
    }
  };

  // Only for desktop: open on hover, close on mouse leave
  const handleMouseEnter = (event: React.MouseEvent<HTMLElement>) => {
    if (!isMobile) {
      setAnchorEl(event.currentTarget);
    }
  };
  const handleMouseLeave = () => {
    if (!isMobile) {
      setAnchorEl(null);
    }
  };

  const open = Boolean(anchorEl);

  return (
    <>
      <Card
        sx={{
          minWidth: 100,
          maxWidth: 170,
          borderRadius: 2,
          boxShadow: 2,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          height: 48,
          mb: { xs: 1, md: 0 },
          mr: 0,
          ml: 'auto',
          cursor: 'pointer',
          userSelect: 'none'
        }}
        elevation={2}
        onClick={isMobile ? handleOpen : undefined}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        role="button"
        tabIndex={0}
        aria-describedby="legend-popover"
      >
        <CardContent
          sx={{
            display: 'flex',
            alignItems: 'center',
            p: '8px !important'
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', mr: 1 }}>
            {LEGEND_COLORS.map(({ color, key }, idx) => (
              <Circle
                key={key}
                size={12}
                stroke={color}
                fill="none"
                strokeWidth={2}
                style={{
                  marginRight: idx !== LEGEND_COLORS.length - 1 ? 4 : 0,
                  display: 'block'
                }}
              />
            ))}
          </Box>
          <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
            Legend
          </Typography>
        </CardContent>
      </Card>

      <Popover
        id="legend-popover"
        open={open}
        anchorEl={anchorEl}
        onClose={() => setAnchorEl(null)}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
        PaperProps={{
          sx: {
            borderRadius: 2,
            p: 2,
            minWidth: 200,
            boxShadow: 4,
            backgroundColor: theme.palette.background.paper,
          },
        }}
        disableRestoreFocus
        // For desktop, open on hover/mouse leave
        // For mobile, open/close on click
        // This avoids focus trap issues on mobile
      >
        <Box>
          <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>
            Score Legend
          </Typography>
          {LEGEND_COLORS.map(({ color, key, label }) => (
            <Box
              key={key}
              sx={{
                display: 'flex',
                alignItems: 'center',
                mb: 1,
                '&:last-child': { mb: 0 }
              }}
            >
              <Circle
                size={14}
                stroke={color}
                fill="none"
                strokeWidth={2}
                style={{ marginRight: 8 }}
              />
              <Typography variant="body2">{label}</Typography>
            </Box>
          ))}
        </Box>
      </Popover>
    </>
  );
};

export default LegendContainer;


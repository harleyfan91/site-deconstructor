import React from 'react';
import { Card, CardContent, Typography, Box, Popover } from '@mui/material';
import { Circle } from 'lucide-react';
import { useTheme } from '@mui/material/styles';

// Use theme palette for legend meaning
const useLegendColors = (theme: any) => [
  { color: theme.palette.grey[400], key: 'gray', label: 'Unknown/Not detected' },
  { color: theme.palette.success.main, key: 'green1', label: 'Good / Secure / Passing' },
  { color: theme.palette.warning.main, key: 'orange', label: 'Warning / Needs improvement' },
  { color: theme.palette.error.main, key: 'red', label: 'Critical issue / Failing' }
];

const LegendContainer: React.FC = () => {
  const theme = useTheme();
  const LEGEND_COLORS = useLegendColors(theme);

  // Use ref for stable anchor
  const anchorRef = React.useRef<HTMLDivElement | null>(null);
  const [open, setOpen] = React.useState(false);

  const handleClick = () => {
    setOpen((prev) => !prev);
  };

  const handleClose = () => {
    setOpen(false);
  };

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
        onClick={handleClick}
        role="button"
        tabIndex={0}
        aria-describedby="legend-popover"
        ref={anchorRef}
      >
        <CardContent
          sx={{
            display: 'flex',
            alignItems: 'center',
            p: '4px !important'
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
        anchorEl={anchorRef.current}
        onClose={handleClose}
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
            p: 1,
            minWidth: 200,
            boxShadow: 4,
            backgroundColor: theme.palette.background.paper,
          },
        }}
        disableRestoreFocus
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

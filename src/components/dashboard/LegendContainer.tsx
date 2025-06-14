
import React from 'react';
import { Card, CardContent, Typography, Box } from '@mui/material';
import { Circle } from 'lucide-react';

const LEGEND_COLORS = [
  { color: '#BDBDBD', key: 'gray' },
  { color: '#43A047', key: 'green1' },
  { color: '#FFB300', key: 'orange' },
  { color: '#00B894', key: 'green2' }
];

const LegendContainer: React.FC = () => (
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
      // Inherit background from theme like other dashboard containers
    }}
    elevation={2}
  >
    <CardContent
      sx={{
        display: 'flex',
        alignItems: 'center',
        p: '8px !important'
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', mr: 1 }}>
        {LEGEND_COLORS.map(({ color, key }) => (
          <Circle
            key={key}
            size={18}
            stroke={color}
            fill="none"
            strokeWidth={2}
            style={{ marginRight: key !== 'green2' ? 6 : 0, display: 'block' }}
          />
        ))}
      </Box>
      <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
        Legend
      </Typography>
    </CardContent>
  </Card>
);

export default LegendContainer;

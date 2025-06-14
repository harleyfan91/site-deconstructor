
import React from 'react';
import { Card, CardContent, Typography } from '@mui/material';

const LegendContainer: React.FC = () => (
  <Card
    sx={{
      minWidth: 100,
      maxWidth: 140,
      borderRadius: 2,
      boxShadow: 2,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      height: 48,
      mb: { xs: 1, md: 0 },
      mr: 0,
      ml: 'auto',
      bgcolor: (theme) => theme.palette.background.paper // Updated to match other cards
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
      <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
        Legend
      </Typography>
    </CardContent>
  </Card>
);

export default LegendContainer;

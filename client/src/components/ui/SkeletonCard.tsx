import React from 'react';
import { Card, CardContent, Box, Skeleton, Typography } from '@mui/material';

interface SkeletonCardProps {
  title: string;
  lines?: number;
  height?: number;
}

const SkeletonCard: React.FC<SkeletonCardProps> = ({ 
  title, 
  lines = 3, 
  height = 200 
}) => {
  return (
    <Card
      sx={{
        height: height,
        transition: 'all 0.3s ease-in-out',
        '&:hover': {
          transform: 'translateY(-2px)',
          boxShadow: 3,
        },
      }}
    >
      <CardContent sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
        {/* Header with icon and title */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
          <Skeleton variant="circular" width={24} height={24} />
          <Typography variant="h6" component="h3" sx={{ fontWeight: 600 }}>
            {title}
          </Typography>
        </Box>

        {/* Content skeleton */}
        <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 1 }}>
          {Array.from({ length: lines }).map((_, index) => (
            <Skeleton
              key={index}
              variant="text"
              width={index === lines - 1 ? '60%' : '100%'}
              height={20}
              animation="wave"
            />
          ))}
          
          {/* Additional visual elements */}
          <Box sx={{ mt: 'auto', pt: 2 }}>
            <Skeleton variant="rectangular" width="100%" height={40} />
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
};

export default SkeletonCard;
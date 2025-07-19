import React from 'react';
import { Card, CardContent, Box, Typography, Skeleton } from '@mui/material';

interface SkeletonCardProps {
  title: string;
  height?: number;
  showIcon?: boolean;
}

const SkeletonCard: React.FC<SkeletonCardProps> = ({ 
  title, 
  height = 300, 
  showIcon = true 
}) => {
  return (
    <Card sx={{ borderRadius: 2, height }}>
      <CardContent sx={{ p: 2, height: '100%' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
          {showIcon && (
            <Skeleton variant="circular" width={24} height={24} />
          )}
          <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
            {title}
          </Typography>
        </Box>
        
        {/* Shimmer content */}
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, flex: 1 }}>
          <Skeleton variant="rectangular" height={60} sx={{ borderRadius: 1 }} />
          <Skeleton variant="rectangular" height={40} sx={{ borderRadius: 1 }} />
          <Skeleton variant="rectangular" height={50} sx={{ borderRadius: 1 }} />
          
          {height > 200 && (
            <>
              <Skeleton variant="rectangular" height={30} sx={{ borderRadius: 1 }} />
              <Skeleton variant="rectangular" height={45} sx={{ borderRadius: 1 }} />
            </>
          )}
        </Box>
      </CardContent>
    </Card>
  );
};

export default SkeletonCard;
import React from 'react';
import { Box, Typography, Card, CardContent } from '@mui/material';
import { useTheme } from '@mui/material/styles';

interface TwitterPreviewProps {
  title?: string;
  description?: string;
  image?: string;
  domain?: string;
}

const TwitterPreview: React.FC<TwitterPreviewProps> = ({ 
  title = 'Page Title', 
  description = 'Page description will appear here', 
  image,
  domain = 'example.com'
}) => {
  const theme = useTheme();

  return (
    <Card 
      variant="outlined" 
      sx={{ 
        maxWidth: 506, 
        borderRadius: 2,
        border: `1px solid ${theme.palette.divider}`,
        '&:hover': {
          borderColor: theme.palette.primary.main,
          boxShadow: theme.shadows[2]
        }
      }}
    >
      {image && (
        <Box
          sx={{
            width: '100%',
            height: 254,
            backgroundImage: `url(${image})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundColor: theme.palette.grey[100]
          }}
        />
      )}
      <CardContent sx={{ p: 2 }}>
        <Typography 
          variant="caption" 
          color="text.secondary" 
          sx={{ 
            fontSize: '0.8rem',
            textTransform: 'uppercase',
            fontWeight: 500
          }}
        >
          {domain}
        </Typography>
        <Typography 
          variant="h6" 
          sx={{ 
            fontSize: '1rem',
            fontWeight: 600,
            lineHeight: 1.3,
            mt: 0.5,
            display: '-webkit-box',
            WebkitBoxOrient: 'vertical',
            WebkitLineClamp: 2,
            overflow: 'hidden'
          }}
        >
          {title}
        </Typography>
        <Typography 
          variant="body2" 
          color="text.secondary"
          sx={{ 
            fontSize: '0.9rem',
            lineHeight: 1.4,
            mt: 0.5,
            display: '-webkit-box',
            WebkitBoxOrient: 'vertical',
            WebkitLineClamp: 2,
            overflow: 'hidden'
          }}
        >
          {description}
        </Typography>
      </CardContent>
    </Card>
  );
};

export default TwitterPreview;
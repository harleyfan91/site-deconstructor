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
        borderRadius: '16px',
        border: '1px solid rgb(207, 217, 222)',
        backgroundColor: '#ffffff',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto',
        '&:hover': {
          borderColor: 'rgb(29, 155, 240)',
          boxShadow: '0 0 15px rgba(29, 155, 240, 0.2)'
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
          sx={{ 
            fontSize: '15px',
            color: 'rgb(83, 100, 113)',
            fontWeight: 400,
            lineHeight: 1.3125
          }}
        >
          {domain}
        </Typography>
        <Typography 
          variant="h6" 
          sx={{ 
            fontSize: '15px',
            fontWeight: 700,
            lineHeight: 1.3125,
            color: 'rgb(15, 20, 25)',
            mt: 0.25,
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
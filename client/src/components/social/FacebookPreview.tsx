import React from 'react';
import { Box, Typography, Card, CardContent } from '@mui/material';
import { useTheme } from '@mui/material/styles';

interface FacebookPreviewProps {
  title?: string;
  description?: string;
  image?: string;
  domain?: string;
}

const FacebookPreview: React.FC<FacebookPreviewProps> = ({ 
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
        maxWidth: 500, 
        borderRadius: '8px',
        border: '1px solid rgb(221, 223, 226)',
        backgroundColor: '#ffffff',
        fontFamily: 'Helvetica, Arial, sans-serif',
        '&:hover': {
          borderColor: 'rgb(24, 119, 242)',
          boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)'
        }
      }}
    >
      {image && (
        <Box
          sx={{
            width: '100%',
            height: 262,
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
            fontSize: '12px',
            color: 'rgb(101, 103, 107)',
            fontWeight: 400,
            textTransform: 'uppercase',
            letterSpacing: '0.5px'
          }}
        >
          {domain}
        </Typography>
        <Typography 
          variant="h6" 
          sx={{ 
            fontSize: '16px',
            fontWeight: 600,
            lineHeight: 1.25,
            color: 'rgb(5, 5, 5)',
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
            fontSize: '0.85rem',
            lineHeight: 1.3,
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

export default FacebookPreview;
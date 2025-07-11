import React from 'react';
import { Box, Typography, Card, CardContent } from '@mui/material';
import { useTheme } from '@mui/material/styles';

interface InstagramPreviewProps {
  title?: string;
  description?: string;
  image?: string;
  domain?: string;
}

const InstagramPreview: React.FC<InstagramPreviewProps> = ({ 
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
        maxWidth: 400, 
        borderRadius: '12px',
        border: '1px solid rgb(219, 219, 219)',
        backgroundColor: '#ffffff',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto',
        '&:hover': {
          borderColor: 'rgb(255, 48, 64)',
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)'
        }
      }}
    >
      {image && (
        <Box
          sx={{
            width: '100%',
            height: 200,
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
            fontSize: '11px',
            color: 'rgb(142, 142, 142)',
            fontWeight: 600,
            textTransform: 'uppercase',
            letterSpacing: '1px'
          }}
        >
          {domain}
        </Typography>
        <Typography 
          variant="h6" 
          sx={{ 
            fontSize: '14px',
            fontWeight: 600,
            lineHeight: 1.3,
            color: 'rgb(38, 38, 38)',
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
            fontSize: '0.8rem',
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

export default InstagramPreview;
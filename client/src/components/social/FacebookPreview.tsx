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
          color="text.secondary" 
          sx={{ 
            fontSize: '0.75rem',
            textTransform: 'uppercase',
            fontWeight: 500
          }}
        >
          {domain}
        </Typography>
        <Typography 
          variant="h6" 
          sx={{ 
            fontSize: '1.1rem',
            fontWeight: 600,
            lineHeight: 1.2,
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
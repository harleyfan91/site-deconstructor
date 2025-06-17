
import React from 'react';
import { Box, Typography, Link } from '@mui/material';

interface UrlDisplayBoxProps {
  url: string;
}

const UrlDisplayBox: React.FC<UrlDisplayBoxProps> = ({ url }) => {
  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        bgcolor: 'background.paper',
        border: '1px solid rgba(0,0,0,0.1)',
        borderRadius: 1,
        px: 2,
        py: 1,
        width: '49%',
        minWidth: 0,
      }}
    >
      <Typography
        variant="caption"
        sx={{
          fontSize: { xs: '0.8rem', sm: '0.85rem' },
          color: 'text.secondary',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
          cursor: 'pointer',
          fontWeight: 'bold',
          textAlign: 'center',
          width: '100%',
        }}
        component={Link}
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        underline="hover"
      >
        {url}
      </Typography>
    </Box>
  );
};

export default UrlDisplayBox;

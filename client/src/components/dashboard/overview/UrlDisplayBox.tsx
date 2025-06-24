
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
        minWidth: 0,
        flexBasis: '50%',
        justifyContent: 'flex-end',
      }}
    >
      <Typography
        variant="caption"
        sx={{
          fontSize: { xs: '0.85rem', sm: '0.9rem' },
          color: 'white',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
          cursor: 'pointer',
          fontWeight: 'bold',
          textAlign: 'right',
          width: '100%',
          textShadow: '0 1px 2px rgba(0,0,0,0.3)',
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

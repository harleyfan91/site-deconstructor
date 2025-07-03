import React, { useEffect, useRef, useState } from 'react';
import { Box, Typography, Link } from '@mui/material';

interface UrlDisplayBoxProps {
  url: string;
}

const UrlDisplayBox: React.FC<UrlDisplayBoxProps> = ({ url }) => {
  const [displayUrl, setDisplayUrl] = useState(url);
  const textRef = useRef<HTMLAnchorElement>(null);

  useEffect(() => {
    const el = textRef.current;
    if (!el) return;

    const updateDisplay = () => {
      if (!el) return;
      el.textContent = url;
      if (el.scrollWidth <= el.clientWidth) {
        if (displayUrl !== url) {
          setDisplayUrl(url);
        }
        return;
      }

      let start = 0;
      let end = url.length;
      let truncated = url;

      while (start < end) {
        const mid = Math.floor((start + end) / 2);
        const candidate = `${url.slice(0, mid)}[…]`;
        el.textContent = candidate;
        if (el.scrollWidth <= el.clientWidth) {
          truncated = candidate;
          start = mid + 1;
        } else {
          end = mid;
        }
      }

      if (displayUrl !== truncated) {
        setDisplayUrl(truncated);
      }
    };

    updateDisplay();
    window.addEventListener('resize', updateDisplay);
    return () => {
      window.removeEventListener('resize', updateDisplay);
    };
  }, [url, displayUrl]);

  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        minWidth: 0,
        flexBasis: '50%',
        maxWidth: '50vw',
        justifyContent: 'flex-end',
      }}
    >
      <Typography
        variant="h6"
        sx={{
          fontSize: { xs: '0.95rem', sm: '1rem' },
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
        title={url}
      >
        {displayUrl}
      </Typography>
    </Box>
  );
};

export default UrlDisplayBox;

import React from 'react';
import {
  Box,
  Card,
  Container,
} from '@mui/material';

const screenshots = [
  'https://via.placeholder.com/400x300?text=Screenshot+1',
  'https://via.placeholder.com/400x300?text=Screenshot+2',
  'https://via.placeholder.com/400x300?text=Screenshot+3',
  'https://via.placeholder.com/400x300?text=Screenshot+4',
];

const LayeredCarousel = () => {
  const [activeIndex, setActiveIndex] = React.useState(0);
  const [startY, setStartY] = React.useState(0);

  const handleTouchStart = (e: React.TouchEvent) => {
    setStartY(e.touches[0].clientY);
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    const endY = e.changedTouches[0].clientY;
    const deltaY = startY - endY;
    
    // Minimum swipe distance to trigger change
    if (Math.abs(deltaY) > 50) {
      if (deltaY > 0) {
        // Swipe up - next image
        setActiveIndex((prev) => (prev + 1) % screenshots.length);
      } else {
        // Swipe down - previous image
        setActiveIndex((prev) => (prev - 1 + screenshots.length) % screenshots.length);
      }
    }
  };

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    if (e.deltaY > 0) {
      // Scroll down - next image
      setActiveIndex((prev) => (prev + 1) % screenshots.length);
    } else {
      // Scroll up - previous image
      setActiveIndex((prev) => (prev - 1 + screenshots.length) % screenshots.length);
    }
  };

  return (
    <Box
      sx={{
        position: 'relative',
        py: { xs: 3, md: 5 }, // Reduced from 8-12 to 3-5 (60% reduction)
        bgcolor: 'transparent',
        overflow: 'hidden',
      }}
    >
      <Container maxWidth="lg" sx={{ position: 'relative' }}>
        <Box 
          sx={{ 
            height: '500px',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            position: 'relative',
            cursor: 'grab',
            '&:active': {
              cursor: 'grabbing',
            },
          }}
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
          onWheel={handleWheel}
        >
          {/* All screenshots layered on top of each other */}
          {screenshots.map((src, index) => {
            const isActive = index === activeIndex;
            const offset = index - activeIndex;
            const absOffset = Math.abs(offset);
            
            return (
              <Card
                key={index}
                sx={{
                  position: 'absolute',
                  width: 350,
                  height: 400,
                  transition: 'all 0.6s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
                  transform: `
                    translateY(${absOffset * -15}px) 
                    translateX(${offset * 8}px)
                    scale(${1 - absOffset * 0.05})
                    rotateX(${absOffset * 2}deg)
                  `,
                  transformOrigin: 'center bottom',
                  zIndex: screenshots.length - absOffset,
                  opacity: absOffset > 2 ? 0 : 1 - absOffset * 0.2,
                  boxShadow: `0 ${8 + absOffset * 4}px ${24 + absOffset * 8}px rgba(0, 0, 0, ${0.15 + absOffset * 0.1})`,
                  borderRadius: 3,
                  overflow: 'hidden',
                  cursor: isActive ? 'grab' : 'pointer',
                  '&:hover': {
                    transform: isActive ? `
                      translateY(${absOffset * -15}px) 
                      translateX(${offset * 8}px)
                      scale(${1 - absOffset * 0.05})
                      rotateX(${absOffset * 2}deg)
                    ` : `
                      translateY(${absOffset * -15 - 5}px) 
                      translateX(${offset * 8}px)
                      scale(${1 - absOffset * 0.05 + 0.02})
                      rotateX(${absOffset * 2}deg)
                    `,
                  },
                }}
                onClick={() => {
                  if (!isActive) {
                    setActiveIndex(index);
                  }
                }}
              >
                <Box
                  component="img"
                  src={src}
                  alt={`Screenshot ${index + 1}`}
                  sx={{ 
                    width: '100%', 
                    height: '100%', 
                    display: 'block',
                    objectFit: 'cover',
                    pointerEvents: 'none',
                  }}
                />
              </Card>
            );
          })}
        </Box>
        
        {/* Optional: Add subtle indicator dots */}
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'center',
            gap: 1,
            mt: 3,
          }}
        >
          {screenshots.map((_, index) => (
            <Box
              key={index}
              sx={{
                width: 8,
                height: 8,
                borderRadius: '50%',
                bgcolor: index === activeIndex ? 'primary.main' : 'rgba(255, 255, 255, 0.3)',
                transition: 'all 0.3s ease',
                cursor: 'pointer',
              }}
              onClick={() => setActiveIndex(index)}
            />
          ))}
        </Box>
      </Container>
    </Box>
  );
};

export default LayeredCarousel;

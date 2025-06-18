
import React from 'react';
import SwipeableViews from 'react-swipeable-views';
import { virtualize } from 'react-swipeable-views-utils';
import {
  Box,
  Card,
  Container,
} from '@mui/material';

const VirtualizeSwipeableViews = virtualize(SwipeableViews);

const screenshots = [
  'https://via.placeholder.com/400x300?text=Screenshot+1',
  'https://via.placeholder.com/400x300?text=Screenshot+2',
  'https://via.placeholder.com/400x300?text=Screenshot+3',
  'https://via.placeholder.com/400x300?text=Screenshot+4',
];

const LayeredCarousel = () => {
  const [activeStep, setActiveStep] = React.useState(0);

  const handleStepChange = (step: number) => {
    setActiveStep(step % screenshots.length);
  };

  const slideRenderer = ({ index, key }: { index: number; key: string }) => {
    const screenshotIndex = index % screenshots.length;
    return (
      <Box
        key={key}
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '500px',
          position: 'relative',
        }}
      >
        {/* Render all screenshots with layered effect */}
        {screenshots.map((src, imgIndex) => {
          const offset = (imgIndex - screenshotIndex + screenshots.length) % screenshots.length;
          const isActive = offset === 0;
          const zIndex = screenshots.length - offset;
          
          return (
            <Card
              key={imgIndex}
              sx={{
                position: 'absolute',
                width: 350,
                height: 400,
                transition: 'all 0.6s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
                transform: `
                  translateY(${offset * -15}px) 
                  translateX(${offset * 8}px)
                  scale(${1 - offset * 0.05})
                  rotateX(${offset * 2}deg)
                `,
                transformOrigin: 'center bottom',
                zIndex,
                opacity: offset > 2 ? 0 : 1 - offset * 0.2,
                boxShadow: `0 ${8 + offset * 4}px ${24 + offset * 8}px rgba(0, 0, 0, ${0.15 + offset * 0.1})`,
                borderRadius: 3,
                overflow: 'hidden',
                cursor: offset === 0 ? 'default' : 'pointer',
                '&:hover': {
                  transform: offset === 0 ? `
                    translateY(${offset * -15}px) 
                    translateX(${offset * 8}px)
                    scale(${1 - offset * 0.05})
                    rotateX(${offset * 2}deg)
                  ` : `
                    translateY(${offset * -15 - 5}px) 
                    translateX(${offset * 8}px)
                    scale(${1 - offset * 0.05 + 0.02})
                    rotateX(${offset * 2}deg)
                  `,
                },
              }}
              onClick={() => {
                if (offset > 0) {
                  setActiveStep(imgIndex);
                }
              }}
            >
              <Box
                component="img"
                src={src}
                alt={`Screenshot ${imgIndex + 1}`}
                sx={{ 
                  width: '100%', 
                  height: '100%', 
                  display: 'block',
                  objectFit: 'cover',
                }}
              />
            </Card>
          );
        })}
      </Box>
    );
  };

  return (
    <Box
      sx={{
        position: 'relative',
        py: { xs: 8, md: 12 },
        bgcolor: 'transparent',
        overflow: 'hidden',
      }}
    >
      <Container maxWidth="lg" sx={{ position: 'relative' }}>
        <Box sx={{ overflow: 'visible', height: '500px' }}>
          <VirtualizeSwipeableViews
            index={activeStep}
            onChangeIndex={handleStepChange}
            enableMouseEvents
            axis="y"
            slideRenderer={slideRenderer}
            containerStyle={{ 
              height: '500px',
              overflow: 'visible',
            }}
            slideStyle={{ 
              height: '500px',
              overflow: 'visible',
            }}
          />
        </Box>
      </Container>
    </Box>
  );
};

export default LayeredCarousel;

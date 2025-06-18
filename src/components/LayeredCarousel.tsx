import React from 'react';
import SwipeableViews from 'react-swipeable-views';
import {
  Box,
  Card,
  Container,
  MobileStepper,
  Button,
  useTheme,
} from '@mui/material';
import { KeyboardArrowLeft, KeyboardArrowRight } from '@mui/icons-material';

const screenshots = [
  'https://via.placeholder.com/400x300?text=Screenshot+1',
  'https://via.placeholder.com/400x300?text=Screenshot+2',
  'https://via.placeholder.com/400x300?text=Screenshot+3',
  'https://via.placeholder.com/400x300?text=Screenshot+4',
];

const LayeredCarousel = () => {
  const theme = useTheme();
  const [activeStep, setActiveStep] = React.useState(0);
  const maxSteps = screenshots.length;

  const handleNext = () => {
    setActiveStep((prev) => (prev + 1) % maxSteps);
  };

  const handleBack = () => {
    setActiveStep((prev) => (prev - 1 + maxSteps) % maxSteps);
  };

  const handleStepChange = (step: number) => {
    setActiveStep(step);
  };

  return (
    <Box
      sx={{
        position: 'relative',
        py: { xs: 8, md: 12 },
        bgcolor: 'transparent',
      }}
    >
      <Container maxWidth="lg" sx={{ position: 'relative' }}>
        <Box sx={{ overflow: 'visible' }}>
          <SwipeableViews
            index={activeStep}
            onChangeIndex={handleStepChange}
            enableMouseEvents
            containerStyle={{ overflow: 'visible' }}
            slideStyle={{ paddingLeft: '10%', paddingRight: '10%' }}
          >
            {screenshots.map((src, index) => (
              <Box
                key={src}
                sx={{ display: 'flex', justifyContent: 'center', py: 1 }}
              >
                <Card
                  sx={{
                    width: '100%',
                    maxWidth: 400,
                    height: 250,
                    transition: 'transform 0.4s ease, opacity 0.4s ease',
                    transform: activeStep === index ? 'scale(1)' : 'scale(0.9)',
                    opacity: activeStep === index ? 1 : 0.5,
                  }}
                >
                  <Box
                    component="img"
                    src={src}
                    alt={`Screenshot ${index + 1}`}
                    sx={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                  />
                </Card>
              </Box>
            ))}
          </SwipeableViews>
        </Box>
        <MobileStepper
          steps={maxSteps}
          position="static"
          activeStep={activeStep}
          sx={{ justifyContent: 'center', bgcolor: 'transparent', mt: 2 }}
          nextButton={
            <Button size="small" onClick={handleNext}>
              Next
              {theme.direction === 'rtl' ? (
                <KeyboardArrowLeft />
              ) : (
                <KeyboardArrowRight />
              )}
            </Button>
          }
          backButton={
            <Button size="small" onClick={handleBack}>
              {theme.direction === 'rtl' ? (
                <KeyboardArrowRight />
              ) : (
                <KeyboardArrowLeft />
              )}
              Back
            </Button>
          }
        />
      </Container>
    </Box>
  );
};

export default LayeredCarousel;

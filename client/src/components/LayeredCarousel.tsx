
import React from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import {
  Box,
  Card,
  Container,
  MobileStepper,
  Button,
  useTheme,
} from '@mui/material';
import { KeyboardArrowLeft, KeyboardArrowRight } from '@mui/icons-material';
import { motion } from 'framer-motion';

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
      {/* Floating decorative shapes - consistent sizes */}
      <motion.div
        animate={{
          y: [0, -12, 0],
          rotate: [0, -3, 0],
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 1,
        }}
        style={{
          position: 'absolute',
          top: '20%',
          right: '10%',
          width: 80,
          height: 80,
          background: 'linear-gradient(45deg, #FF6B35, #FF8A65)',
          borderRadius: '16px',
          opacity: 0.08,
          zIndex: 0,
        }}
      />
      <motion.div
        animate={{
          y: [0, 20, 0],
          rotate: [0, 5, 0],
        }}
        transition={{
          duration: 6,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 4,
        }}
        style={{
          position: 'absolute',
          bottom: '15%',
          left: '15%',
          width: 60,
          height: 60,
          background: 'linear-gradient(45deg, #0984E3, #42A5F5)',
          borderRadius: '50%',
          opacity: 0.1,
          zIndex: 0,
        }}
      />

      <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 1 }}>
        <Box sx={{ overflow: 'visible' }}>
          <Swiper
            modules={[Navigation, Pagination]}
            spaceBetween={50}
            slidesPerView={1}
            centeredSlides={true}
            onSlideChange={(swiper) => setActiveStep(swiper.activeIndex)}
            style={{ overflow: 'visible', padding: '0 10%' }}
          >
            {screenshots.map((src, index) => (
              <SwiperSlide key={src}>
                <Box sx={{ display: 'flex', justifyContent: 'center', py: 1 }}>
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
              </SwiperSlide>
            ))}
          </Swiper>
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

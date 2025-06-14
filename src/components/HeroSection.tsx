import React from 'react';
import { Box, Typography, Container, Chip } from '@mui/material';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import URLInputForm from './URLInputForm';
import { useAnalysisContext } from '../contexts/AnalysisContext';

const HeroSection = () => {
  const { analyzeWebsite, loading, data, error } = useAnalysisContext();
  const navigate = useNavigate();

  const recentSearches = [
    'apple.com',
    'stripe.com',
    'linear.app',
    'vercel.com',
  ];

  const handleRecentSearch = async (searchUrl: string) => {
    const fullUrl = `https://${searchUrl}`;
    const result = await analyzeWebsite(fullUrl);
    
    if (result && !error) {
      // Smooth navigation to dashboard after successful analysis
      setTimeout(() => {
        navigate('/dashboard');
      }, 500); // Small delay for smooth UX
    }
  };

  const handleAnalysisComplete = (result: any) => {
    if (result && !error) {
      // Smooth navigation to dashboard after successful analysis
      setTimeout(() => {
        navigate('/dashboard');
      }, 500); // Small delay for smooth UX
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        position: 'relative',
        overflow: 'hidden',
        background: `
          radial-gradient(circle at 20% 50%, rgba(255, 107, 53, 0.3) 0%, transparent 50%),
          radial-gradient(circle at 80% 20%, rgba(9, 132, 227, 0.3) 0%, transparent 50%),
          radial-gradient(circle at 40% 80%, rgba(255, 138, 101, 0.2) 0%, transparent 50%),
          linear-gradient(135deg, #0F0F0F 0%, #1A1A1A 100%)
        `,
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: `
            url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.02'%3E%3Ccircle cx='30' cy='30' r='1'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")
          `,
          animation: 'float 20s ease-in-out infinite',
        },
        '@keyframes float': {
          '0%, 100%': {
            transform: 'translateY(0px)',
          },
          '50%': {
            transform: 'translateY(-20px)',
          },
        },
        // Add mask-image: fade the bottom of HeroSection to transparent (revealing FeatureShowcase underneath)
        WebkitMaskImage: 'linear-gradient(to bottom, black 92%, transparent 100%)',
        maskImage: 'linear-gradient(to bottom, black 92%, transparent 100%)',
        maskSize: '100% 100%',
        WebkitMaskSize: '100% 100%',
        maskRepeat: 'no-repeat',
        WebkitMaskRepeat: 'no-repeat',
      }}
    >
      <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 1 }}>
        <Box
          sx={{
            textAlign: 'center',
            py: { xs: 8, md: 12 },
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
          }}
        >
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <Typography
              variant="h1"
              sx={{
                mb: 3,
                background: 'linear-gradient(135deg, #FFFFFF 0%, rgba(255, 255, 255, 0.8) 100%)',
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                textShadow: '0 4px 20px rgba(255, 107, 53, 0.3)',
              }}
            >
              Deconstruct Any Website
              <br />
              <span
                style={{
                  background: 'linear-gradient(45deg, #FF6B35 30%, #0984E3 90%)',
                  backgroundClip: 'text',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                }}
              >
                In Seconds
              </span>
            </Typography>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <Typography
              variant="h6"
              color="text.secondary"
              sx={{
                mb: 6,
                maxWidth: 600,
                mx: 'auto',
                fontSize: { xs: '1.1rem', md: '1.3rem' },
                lineHeight: 1.6,
              }}
            >
              Analyze colors, fonts, images, and technology stack of any website.
              Perfect for designers, developers, and digital marketers.
            </Typography>
          </motion.div>

          <Box sx={{ width: '100%', display: 'flex', justifyContent: 'center', flexDirection: 'column', alignItems: 'center' }}>
            <URLInputForm onAnalysisComplete={handleAnalysisComplete} />
            
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.6 }}
            >
              <Typography
                variant="body2"
                color="text.secondary"
                sx={{ mb: 2, textAlign: 'center', mt: 3 }}
              >
                Try these popular sites:
              </Typography>
              <Box
                sx={{
                  display: 'flex',
                  flexWrap: 'wrap',
                  gap: 1,
                  justifyContent: 'center',
                }}
              >
                {recentSearches.map((search, index) => (
                  <motion.div
                    key={search}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.3, delay: 0.7 + index * 0.1 }}
                  >
                    <Chip
                      label={search}
                      onClick={() => handleRecentSearch(search)}
                      disabled={loading}
                      sx={{
                        bgcolor: 'rgba(255, 255, 255, 0.1)',
                        color: 'text.primary',
                        '&:hover': {
                          bgcolor: 'rgba(255, 107, 53, 0.2)',
                          transform: 'translateY(-2px)',
                        },
                        transition: 'all 0.3s ease',
                        cursor: 'pointer',
                      }}
                    />
                  </motion.div>
                ))}
              </Box>
            </motion.div>
          </Box>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.8 }}
          >
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{ mt: 4, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1 }}
            >
              Trusted by 50,000+ designers worldwide
              <Box
                component="span"
                sx={{
                  width: 8,
                  height: 8,
                  bgcolor: 'success.main',
                  borderRadius: '50%',
                  animation: 'pulse 2s infinite',
                  '@keyframes pulse': {
                    '0%': {
                      boxShadow: '0 0 0 0 rgba(76, 175, 80, 0.7)',
                    },
                    '70%': {
                      boxShadow: '0 0 0 10px rgba(76, 175, 80, 0)',
                    },
                    '100%': {
                      boxShadow: '0 0 0 0 rgba(76, 175, 80, 0)',
                    },
                  },
                }}
              />
            </Typography>
          </motion.div>
        </Box>
      </Container>

      <motion.div
        animate={{
          y: [0, -20, 0],
          rotate: [0, 5, 0],
        }}
        transition={{
          duration: 6,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        style={{
          position: 'absolute',
          top: '20%',
          left: '10%',
          width: 60,
          height: 60,
          background: 'linear-gradient(45deg, #FF6B35, #FF8A65)',
          borderRadius: '16px',
          opacity: 0.1,
          zIndex: 0,
        }}
      />
      
      <motion.div
        animate={{
          y: [0, 20, 0],
          rotate: [0, -5, 0],
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 2,
        }}
        style={{
          position: 'absolute',
          bottom: '20%',
          right: '15%',
          width: 80,
          height: 80,
          background: 'linear-gradient(45deg, #0984E3, #42A5F5)',
          borderRadius: '50%',
          opacity: 0.1,
          zIndex: 0,
        }}
      />
    </Box>
  );
};

export default HeroSection;

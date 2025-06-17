import React from 'react';
import { Box, Typography, Container, Chip } from '@mui/material';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import URLInputForm from './URLInputForm';
import { useAnalysisContext } from '../contexts/AnalysisContext';

/**
 * HeroSection
 * 
 * Landing page main hero section with animated heading, recent search shortcuts,
 * and call-to-action input form. Uses MUI and framer-motion for responsive visuals.
 * 
 * Behavior and UI must NOT be changed!
 */

const recentSearches = [
  'apple.com',
  'stripe.com',
  'linear.app',
  'vercel.com',
];

/** Animation/transition helpers for motion.divs */
const motionProps = {
  heading: {
    initial: { opacity: 0, y: 30 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.8 },
  },
  subheading: {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.8, delay: 0.2 },
  },
  formSection: {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    transition: { duration: 0.6, delay: 0.6 },
  },
  trustedBy: {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    transition: { duration: 0.8, delay: 0.8 },
  },
};

/** Mask/gradient constants for easier maintenance */
const MASK_IMAGE = `linear-gradient(
  to bottom,
  black 0%,
  black 62%,
  black 75%,
  transparent 100%
)`;

/**
 * Handles a click on one of the recent search shortcut chips.
 * 
 * @param analyzeWebsite Analysis function provided by context
 * @param navigate React Router navigate function
 * @param loading Prevents new analysis while running
 * @param error Analysis error, triggers UX delay/route
 */
const handleRecentSearch = async ({
  searchUrl,
  analyzeWebsite,
  navigate,
  error,
  loading,
}: {
  searchUrl: string,
  analyzeWebsite: (url: string) => Promise<any>,
  navigate: (path: string) => void,
  error: any,
  loading: boolean,
}) => {
  if (loading) return;
  const fullUrl = `https://${searchUrl}`;
  const result = await analyzeWebsite(fullUrl);
  if (result && !error) {
    // Smooth navigation to dashboard after successful analysis
    setTimeout(() => navigate('/dashboard'), 500);
  }
};

/**
 * Handles successful analysis completion from the URL input form.
 * 
 * @param result The result of website analysis
 * @param navigate React Router navigate function
 * @param error Analysis error
 */
const handleAnalysisComplete = (
  result: any, navigate: (path: string) => void, error: any
) => {
  if (result && !error) {
    setTimeout(() => navigate('/dashboard'), 500);
  }
};

const HeroSection = () => {
  const { analyzeWebsite, loading, error } = useAnalysisContext();
  const navigate = useNavigate();

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        position: 'relative',
        overflow: 'hidden',
        // Reduce top padding further so the hero sits higher
        pt: { xs: 0.5, md: 1 },
        pb: { xs: 1, md: 2 },
      }}
    >
      {/* Gradient + mask background applied absolutely below content */}
      <Box
        sx={{
          position: 'absolute',
          inset: 0,
          zIndex: 0,
          // Same background & mask as before
          background: `
            radial-gradient(circle at 20% 50%, rgba(255, 107, 53, 0.3) 0%, transparent 50%),
            radial-gradient(circle at 80% 20%, rgba(9, 132, 227, 0.3) 0%, transparent 50%),
            radial-gradient(circle at 40% 80%, rgba(255, 138, 101, 0.2) 0%, transparent 50%),
            linear-gradient(135deg, #0F0F0F 0%, #1A1A1A 100%)
          `,
          WebkitMaskImage: MASK_IMAGE,
          maskImage: MASK_IMAGE,
          maskSize: '100% 100%',
          WebkitMaskSize: '100% 100%',
          maskRepeat: 'no-repeat',
          WebkitMaskRepeat: 'no-repeat',
          // SVG dot layer, now as a separate overlay
          '&::after': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            zIndex: 0,
            background: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.02'%3E%3Ccircle cx='30' cy='30' r='1'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
            animation: 'float 20s ease-in-out infinite',
          },
          '@keyframes float': {
            '0%, 100%': { transform: 'translateY(0px)' },
            '50%': { transform: 'translateY(-20px)' },
          },
        }}
      />
      {/* Floating decorative shapes—absolute and Z=0 */}
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
      {/* MAIN CONTENT: positioned relative and zIndex > 0 */}
      <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 1 }}>
        <Box
          sx={{
            textAlign: 'center',
            // Move content higher by cutting the top padding in half
            pb: { xs: 2, md: 3 },
            pt: { xs: 0.5, md: 1 },
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            position: 'relative',
            zIndex: 2,
          }}
        >
          <motion.div {...motionProps.heading}>
            <Typography
              variant="h1"
              sx={{
                // Reduce bottom margin
                mb: { xs: 2, md: 2.5 },
                // Slightly reduce font sizes for better fit
                fontSize: { xs: '2.2rem', md: '3rem', lg: '3.2rem' },
                lineHeight: { xs: 1.1, md: 1.15 },
                background: 'linear-gradient(135deg, #FFFFFF 0%, rgba(255, 255, 255, 0.8) 100%)',
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                textShadow: '0 4px 20px rgba(255, 107, 53, 0.3)',
                zIndex: 2,
                position: 'relative',
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
          <motion.div {...motionProps.subheading}>
            <Typography
              variant="h6"
              color="text.secondary"
              sx={{
                // Reduce bottom margin significantly
                mb: { xs: 3, md: 4 },
                maxWidth: 600,
                mx: 'auto',
                // Slightly reduce font size for better fit
                fontSize: { xs: '1rem', md: '1.1rem' },
                lineHeight: 1.5,
                zIndex: 2,
                position: 'relative',
              }}
            >
              Analyze colors, fonts, images, and technology stack of any website.
              Perfect for designers, developers, and digital marketers.
            </Typography>
          </motion.div>
          {/* Input & popular sites shortcuts */}
          <Box sx={{ width: '100%', display: 'flex', justifyContent: 'center', flexDirection: 'column', alignItems: 'center', zIndex: 3, position: 'relative' }}>
            <URLInputForm
              onAnalysisComplete={result => handleAnalysisComplete(result, navigate, error)}
            />
            <motion.div {...motionProps.formSection}>
              <Typography
                variant="body2"
                color="text.secondary"
                sx={{ 
                  // Reduce margins around "Try these popular sites"
                  mb: 1.5, 
                  textAlign: 'center', 
                  mt: 2, 
                  zIndex: 2, 
                  position: 'relative',
                  fontSize: { xs: '0.9rem', md: '1rem' }
                }}
              >
                Try these popular sites:
              </Typography>
              <Box
                sx={{
                  display: 'flex',
                  flexWrap: 'wrap',
                  gap: 1,
                  justifyContent: 'center',
                  zIndex: 3,
                  position: 'relative',
                  // Reduce bottom margin
                  mb: { xs: 2, md: 3 },
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
                      onClick={() =>
                        handleRecentSearch({
                          searchUrl: search,
                          analyzeWebsite,
                          navigate,
                          error,
                          loading,
                        })
                      }
                      disabled={loading}
                      sx={{
                        bgcolor: 'rgba(255, 255, 255, 0.1)',
                        color: 'text.primary',
                        // Slightly smaller chips for better fit
                        fontSize: { xs: '0.8rem', md: '0.875rem' },
                        height: { xs: 28, md: 32 },
                        '&:hover': {
                          bgcolor: 'rgba(255, 107, 53, 0.2)',
                          transform: 'translateY(-2px)',
                        },
                        transition: 'all 0.3s ease',
                        cursor: 'pointer',
                        zIndex: 3,
                        position: 'relative',
                      }}
                    />
                  </motion.div>
                ))}
              </Box>
            </motion.div>
          </Box>
          <motion.div {...motionProps.trustedBy}>
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{
                // Reduce top margin
                mt: { xs: 2, md: 3 },
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 1,
                zIndex: 2,
                position: 'relative',
                fontSize: { xs: '0.85rem', md: '0.9rem' },
              }}
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
                  zIndex: 2,
                  position: 'relative',
                }}
              />
            </Typography>
          </motion.div>
        </Box>
      </Container>
    </Box>
  );
};

export default HeroSection;

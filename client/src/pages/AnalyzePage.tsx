import React from 'react';
import { Box, Container, Typography, Chip } from '@mui/material';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import URLInputForm from '../components/URLInputForm';
import AppHeader from '../components/AppHeader';
import { useAnalysisContext } from '../contexts/AnalysisContext';
import { useAnalysisApi } from '../hooks/useAnalysisApi';

interface AnalyzePageProps {
  darkMode: boolean;
  toggleDarkMode: () => void;
}

/** Animation/transition helpers for motion.divs */
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      delayChildren: 0.3,
      staggerChildren: 0.2
    }
  }
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1
  }
};

/** Mask/gradient constants for easier maintenance */
const gradientMask = 'linear-gradient(90deg, transparent, white 20%, white 80%, transparent)';

/**
 * Handles a click on one of the recent search shortcut chips.
 */
const handleRecentSearchClick = async (
  url: string,
  analyzeWebsite: (url: string) => Promise<any>,
  navigate: (path: string) => void,
  loading: boolean,
  error: string | null
) => {
  if (loading) return;

  try {
    console.log(`🚀 Quick shortcut analysis for: ${url}`);
    await analyzeWebsite(url);
    
    if (error) {
      console.error('Analysis failed, staying on current page');
      return;
    }
    
    navigate('/dashboard');
  } catch (err) {
    console.error('Shortcut analysis error:', err);
  }
};

/**
 * Handles successful analysis completion from the URL input form.
 */
const handleAnalysisComplete = (
  result: any,
  navigate: (path: string) => void,
  error: string | null
) => {
  if (error) {
    console.error('Analysis completed with error, staying on page');
    return;
  }
  
  console.log('Analysis completed successfully, navigating to dashboard');
  navigate('/dashboard');
};

const AnalyzePage = ({ darkMode, toggleDarkMode }: AnalyzePageProps) => {
  const navigate = useNavigate();
  const { analyzeWebsite } = useAnalysisContext();
  const { loading, error } = useAnalysisApi();

  const recentSearches = [
    'stripe.com',
    'linear.app', 
    'vercel.com',
    'github.com'
  ];

  return (
    <Box>
      <AppHeader darkMode={darkMode} toggleDarkMode={toggleDarkMode} />
      
      <Container maxWidth="lg" sx={{ pt: 4 }}>
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          style={{
            minHeight: '80vh',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            textAlign: 'center',
            paddingTop: '2rem',
            paddingBottom: '4rem'
          }}
        >
          {/* Main Heading */}
          <motion.div variants={itemVariants}>
            <Typography
              variant="h1"
              sx={{
                fontSize: { xs: '2.5rem', sm: '3.5rem', md: '4.5rem' },
                fontWeight: 800,
                lineHeight: 1.1,
                mb: 3,
                background: (theme) => `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                textAlign: 'center'
              }}
            >
              Analyze Any Website
            </Typography>
          </motion.div>

          {/* Subtitle */}
          <motion.div variants={itemVariants}>
            <Typography
              variant="h5"
              sx={{
                fontSize: { xs: '1.1rem', sm: '1.3rem', md: '1.5rem' },
                fontWeight: 300,
                color: 'text.secondary',
                mb: 4,
                maxWidth: '600px',
                lineHeight: 1.4
              }}
            >
              Get comprehensive insights into any website's performance, SEO, design, and technical implementation
            </Typography>
          </motion.div>

          {/* URL Input Form */}
          <motion.div variants={itemVariants} style={{ width: '100%', maxWidth: '600px', marginBottom: '3rem' }}>
            <URLInputForm 
              onAnalysisComplete={(result) => handleAnalysisComplete(result, navigate, error)}
            />
          </motion.div>

          {/* Recent Searches */}
          <motion.div variants={itemVariants}>
            <Typography
              variant="body2"
              sx={{
                color: 'text.secondary',
                mb: 2,
                fontSize: '0.9rem'
              }}
            >
              Try these popular sites
            </Typography>
            
            <Box
              sx={{
                display: 'flex',
                gap: 1,
                flexWrap: 'wrap',
                justifyContent: 'center',
                maxWidth: '500px',
                mask: gradientMask,
                WebkitMask: gradientMask
              }}
            >
              {recentSearches.map((url, index) => (
                <motion.div
                  key={url}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.8 + index * 0.1 }}
                >
                  <Chip
                    label={url}
                    variant="outlined"
                    size="small"
                    clickable
                    onClick={() => handleRecentSearchClick(url, analyzeWebsite, navigate, loading, error)}
                    disabled={loading}
                    sx={{
                      fontSize: '0.75rem',
                      height: '28px',
                      borderColor: 'divider',
                      color: 'text.secondary',
                      '&:hover': {
                        borderColor: 'primary.main',
                        color: 'primary.main',
                        backgroundColor: 'transparent'
                      },
                      '&.Mui-disabled': {
                        opacity: 0.5
                      }
                    }}
                  />
                </motion.div>
              ))}
            </Box>
          </motion.div>
        </motion.div>
      </Container>
    </Box>
  );
};

export default AnalyzePage;
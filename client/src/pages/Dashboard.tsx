import React, { useEffect } from 'react';
import { Box, Container } from '@mui/material';
import { motion } from 'framer-motion';
import { useLocation } from 'react-router-dom';
import AppHeader from '../components/AppHeader';
import DashboardContent from '../components/DashboardContent';
import { useAnalysisContext } from '../contexts/AnalysisContext';

interface DashboardProps {
  darkMode: boolean;
  toggleDarkMode: () => void;
}

const Dashboard = ({ darkMode, toggleDarkMode }: DashboardProps) => {
  const location = useLocation();
  const { analyzeWebsite, data } = useAnalysisContext();

  useEffect(() => {
    // Check if there's a URL parameter - trigger analysis immediately
    const urlParams = new URLSearchParams(location.search);
    const urlToAnalyze = urlParams.get('url');
    
    if (urlToAnalyze && !data) {
      console.log('🚀 Starting analysis for URL parameter:', urlToAnalyze);
      analyzeWebsite(urlToAnalyze);
    }
  }, [location.search, analyzeWebsite, data]);

  return (
    <Box>
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <AppHeader darkMode={darkMode} toggleDarkMode={toggleDarkMode} />
      </motion.div>
      
      <Container maxWidth="xl" sx={{ mt: 2, mb: 2, px: { xs: 1, sm: 2 } }}>
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          <DashboardContent />
        </motion.div>
      </Container>
    </Box>
  );
};

export default Dashboard;

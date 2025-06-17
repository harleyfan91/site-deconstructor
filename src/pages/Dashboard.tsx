
import React, { useEffect } from 'react';
import { Box, Container } from '@mui/material';
import { motion } from 'framer-motion';
import AppHeader from '../components/AppHeader';
import DashboardContent from '../components/DashboardContent';
import URLInputForm from '../components/URLInputForm';

interface DashboardProps {
  darkMode: boolean;
  toggleDarkMode: () => void;
}

const Dashboard = ({ darkMode, toggleDarkMode }: DashboardProps) => {
  useEffect(() => {
    // Auto-scroll to hide URL input after landing on dashboard
    const timer = setTimeout(() => {
      // Increase height to account for mobile button layout and ensure it's hidden
      const urlInputHeight = 160; // Increased from 120 to account for mobile analyze button
      window.scrollTo({
        top: urlInputHeight,
        behavior: 'smooth'
      });
    }, 1500); // Increased from 800ms to 1500ms for better timing

    return () => clearTimeout(timer);
  }, []);

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
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 2 }}>
            <URLInputForm />
          </Box>
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
        >
          <DashboardContent />
        </motion.div>
      </Container>
    </Box>
  );
};

export default Dashboard;

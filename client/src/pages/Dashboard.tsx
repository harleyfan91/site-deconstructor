import React from 'react';
import { Box, Container } from '@mui/material';
import { motion } from 'framer-motion';
import AppHeader from '../components/AppHeader';
import DashboardContent from '../components/DashboardContent';

interface DashboardProps {
  darkMode: boolean;
  toggleDarkMode: () => void;
}

const Dashboard = ({ darkMode, toggleDarkMode }: DashboardProps) => {
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

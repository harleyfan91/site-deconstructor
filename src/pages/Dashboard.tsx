
import React from 'react';
import { Box, Container } from '@mui/material';
import AppHeader from '../components/AppHeader';
import DashboardContent from '../components/DashboardContent';
import URLInputForm from '../components/URLInputForm';

interface DashboardProps {
  darkMode: boolean;
  toggleDarkMode: () => void;
}

const Dashboard = ({ darkMode, toggleDarkMode }: DashboardProps) => {
  return (
    <Box>
      <AppHeader darkMode={darkMode} toggleDarkMode={toggleDarkMode} />
      <Container maxWidth="xl" sx={{ mt: 2, mb: 2, px: { xs: 1, sm: 2 } }}>
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 2 }}>
          <URLInputForm />
        </Box>
        <DashboardContent />
      </Container>
    </Box>
  );
};

export default Dashboard;

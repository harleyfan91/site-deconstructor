
import React from 'react';
import { Box, Container } from '@mui/material';
import AppHeader from '../components/AppHeader';
import DashboardContent from '../components/DashboardContent';

const Dashboard = () => {
  const [darkMode, setDarkMode] = React.useState(false);

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
  };

  return (
    <Box>
      <AppHeader darkMode={darkMode} toggleDarkMode={toggleDarkMode} />
      <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
        <DashboardContent />
      </Container>
    </Box>
  );
};

export default Dashboard;

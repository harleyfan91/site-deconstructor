
import React from 'react';
import { Box, Container } from '@mui/material';
import AppHeader from '../components/AppHeader';
import DashboardContent from '../components/DashboardContent';
import TestApiComponent from '../components/TestApiComponent';
import { AnalysisProvider } from '../contexts/AnalysisContext';

interface DashboardProps {
  darkMode: boolean;
  toggleDarkMode: () => void;
}

const Dashboard = ({ darkMode, toggleDarkMode }: DashboardProps) => {
  return (
    <AnalysisProvider>
      <Box>
        <AppHeader darkMode={darkMode} toggleDarkMode={toggleDarkMode} />
        <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
          <TestApiComponent />
          <DashboardContent />
        </Container>
      </Box>
    </AnalysisProvider>
  );
};

export default Dashboard;

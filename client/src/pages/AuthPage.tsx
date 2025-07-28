import React from 'react';
import { Box, Container, Typography } from '@mui/material';
import AppHeader from '../components/AppHeader';
import { Login } from '../components/Auth/Login';

interface AuthPageProps {
  darkMode: boolean;
  toggleDarkMode: () => void;
}

const AuthPage = ({ darkMode, toggleDarkMode }: AuthPageProps) => {
  return (
    <Box>
      <AppHeader darkMode={darkMode} toggleDarkMode={toggleDarkMode} />
      
      <Container maxWidth="sm" sx={{ mt: 4, mb: 4 }}>
        <Box sx={{ textAlign: 'center', mb: 4 }}>
          <Typography variant="h4" gutterBottom>
            Welcome to Site Deconstructor
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Sign in to start analyzing websites and save your results
          </Typography>
        </Box>
        
        <Login />
      </Container>
    </Box>
  );
};

export default AuthPage;
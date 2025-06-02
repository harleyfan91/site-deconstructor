
import React, { useState } from 'react';
import { Box } from '@mui/material';
import AppHeader from '../components/AppHeader';
import HeroSection from '../components/HeroSection';
import FeatureShowcase from '../components/FeatureShowcase';
import PricingSection from '../components/PricingSection';

const LandingPage = () => {
  const [darkMode, setDarkMode] = useState(false);

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
  };

  return (
    <Box>
      <AppHeader darkMode={darkMode} toggleDarkMode={toggleDarkMode} />
      <HeroSection />
      <FeatureShowcase />
      <PricingSection />
    </Box>
  );
};

export default LandingPage;

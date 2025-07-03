import React from 'react';
import { Box } from '@mui/material';
import AppHeader from '../components/AppHeader';
import HeroSection from '../components/HeroSection';
import LayeredCarousel from '../components/LayeredCarousel';
import FeatureShowcase from '../components/FeatureShowcase';
import PricingSection from '../components/PricingSection';

interface LandingPageProps {
  darkMode: boolean;
  toggleDarkMode: () => void;
}

const LandingPage = ({ darkMode, toggleDarkMode }: LandingPageProps) => {
  return (
    <Box>
      <AppHeader darkMode={darkMode} toggleDarkMode={toggleDarkMode} />
      <HeroSection />
      <LayeredCarousel />
      <FeatureShowcase />
      <PricingSection />
    </Box>
  );
};

export default LandingPage;
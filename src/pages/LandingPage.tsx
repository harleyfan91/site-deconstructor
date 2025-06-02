
import React from 'react';
import { Box } from '@mui/material';
import AppHeader from '../components/AppHeader';
import HeroSection from '../components/HeroSection';
import FeatureShowcase from '../components/FeatureShowcase';
import PricingSection from '../components/PricingSection';

const LandingPage = () => {
  return (
    <Box>
      <AppHeader />
      <HeroSection />
      <FeatureShowcase />
      <PricingSection />
    </Box>
  );
};

export default LandingPage;

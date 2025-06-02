
import React, { useState } from 'react';
import LandingPage from './LandingPage';

const Index = () => {
  const [darkMode, setDarkMode] = useState(true);

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
  };

  return <LandingPage darkMode={darkMode} toggleDarkMode={toggleDarkMode} />;
};

export default Index;

import { ThemeProvider, CssBaseline } from '@mui/material';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { createAppTheme } from './theme/theme';
import LandingPage from './pages/LandingPage';
import Dashboard from './pages/Dashboard';
import { AnalysisProvider } from './contexts/AnalysisContext';
import { useState } from 'react';

const App = () => {
  const [darkMode, setDarkMode] = useState(true); // Default to dark mode

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
  };

  const theme = createAppTheme(darkMode);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AnalysisProvider>
        <Router>
          <Routes>
            <Route path="/" element={<LandingPage darkMode={darkMode} toggleDarkMode={toggleDarkMode} />} />
            <Route path="/dashboard" element={<Dashboard darkMode={darkMode} toggleDarkMode={toggleDarkMode} />} />
          </Routes>
        </Router>
      </AnalysisProvider>
    </ThemeProvider>
  );
};

export default App;
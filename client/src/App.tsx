import { ThemeProvider, CssBaseline } from '@mui/material';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { createAppTheme } from './theme/theme';
import LandingPage from './pages/LandingPage';
import Dashboard from './pages/Dashboard';
import AnalyzePage from './pages/AnalyzePage';
import PanelTestPage from './pages/PanelTestPage';
import ProgressTestPage from './pages/ProgressTestPage';
import AuthPage from './pages/AuthPage';
import { AnalysisProvider } from './contexts/AnalysisContext';
import { AuthProvider } from './providers/AuthProvider';
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
      <AuthProvider>
        <AnalysisProvider>
          <Router>
          <Routes>
            <Route path="/" element={<LandingPage darkMode={darkMode} toggleDarkMode={toggleDarkMode} />} />
            <Route path="/dashboard" element={<Dashboard darkMode={darkMode} toggleDarkMode={toggleDarkMode} />} />
            <Route path="/dashboard/:scanId" element={<Dashboard darkMode={darkMode} toggleDarkMode={toggleDarkMode} />} />
            <Route path="/analyze" element={<AnalyzePage darkMode={darkMode} toggleDarkMode={toggleDarkMode} />} />
            <Route path="/panel-test" element={<PanelTestPage darkMode={darkMode} toggleDarkMode={toggleDarkMode} />} />
            <Route path="/progress-test" element={<ProgressTestPage darkMode={darkMode} toggleDarkMode={toggleDarkMode} />} />
            <Route path="/auth" element={<AuthPage darkMode={darkMode} toggleDarkMode={toggleDarkMode} />} />
          </Routes>
          </Router>
        </AnalysisProvider>
      </AuthProvider>
    </ThemeProvider>
  );
};

export default App;
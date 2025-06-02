
import { ThemeProvider, CssBaseline } from '@mui/material';
import { theme } from './theme/theme';
import LandingPage from './pages/LandingPage';

const App = () => {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <LandingPage />
    </ThemeProvider>
  );
};

export default App;

import { createTheme } from '@mui/material/styles';

export const createAppTheme = (darkMode: boolean) => createTheme({
  palette: {
    mode: darkMode ? 'dark' : 'light',
    primary: {
      main: '#FF6B35',
      light: '#FF8A65',
      dark: '#E64100',
    },
    secondary: {
      main: '#0984E3',
      light: '#42A5F5',
      dark: '#0D47A1',
    },
    // Use legend colors for semantic status
    success: {
      main: '#43A047', // "Good / Secure / Passing"
      light: '#66bb6a',
      dark: '#2e7d32',
      contrastText: '#fff'
    },
    warning: {
      main: '#FFB300', // "Warning / Needs improvement"
      light: '#FFD54F',
      dark: '#FF8F00',
      contrastText: '#fff'
    },
    error: {
      main: '#F44336', // "Critical issue / Failing"
      light: '#ef5350',
      dark: '#c62828',
      contrastText: '#fff'
    },
    // Removed the invalid 'neutral' property here. Replace with palette.grey usage as needed.
    background: {
      default: darkMode ? '#0F0F0F' : '#FFFFFF',
      paper: darkMode ? 'rgba(45, 52, 54, 0.8)' : 'rgba(255, 255, 255, 0.9)',
    },
    text: {
      primary: darkMode ? '#FFFFFF' : '#000000',
      secondary: darkMode ? 'rgba(255, 255, 255, 0.7)' : 'rgba(0, 0, 0, 0.7)',
    },
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontFamily: '"Inter", sans-serif',
      fontWeight: 700,
      fontSize: '3.5rem',
      lineHeight: 1.2,
      '@media (max-width:600px)': {
        fontSize: '2.5rem',
      },
    },
    h2: {
      fontFamily: '"Inter", sans-serif',
      fontWeight: 600,
      fontSize: '2.5rem',
      lineHeight: 1.3,
      '@media (max-width:600px)': {
        fontSize: '2rem',
      },
    },
    h3: {
      fontFamily: '"Inter", sans-serif',
      fontWeight: 600,
      fontSize: '1.75rem',
      lineHeight: 1.4,
    },
    h4: {
      fontFamily: '"Inter", sans-serif',
      fontWeight: 600,
      fontSize: '1.5rem',
      lineHeight: 1.4,
    },
    h5: {
      fontFamily: '"Inter", sans-serif',
      fontWeight: 700,
      fontSize: '1.25rem',
      lineHeight: 1.5,
    },
    h6: {
      fontFamily: '"Inter", sans-serif',
      fontWeight: 600,
      fontSize: '1.1rem',
      lineHeight: 1.5,
    },
    subtitle1: {
      fontFamily: '"Inter", sans-serif',
      fontWeight: 600,
      fontSize: '1rem',
      lineHeight: 1.5,
    },
    subtitle2: {
      fontFamily: '"Inter", sans-serif',
      fontWeight: 500,
      fontSize: '0.875rem',
      lineHeight: 1.5,
    },
    body1: {
      fontFamily: '"Roboto", sans-serif',
      fontWeight: 400,
      fontSize: '1rem',
      lineHeight: 1.6,
    },
    body2: {
      fontFamily: '"Roboto", sans-serif',
      fontWeight: 400,
      fontSize: '0.875rem',
      lineHeight: 1.6,
    },
    caption: {
      fontFamily: '"Roboto", sans-serif',
      fontWeight: 400,
      fontSize: '0.75rem',
      lineHeight: 1.4,
    },
    overline: {
      fontFamily: '"Roboto", sans-serif',
      fontWeight: 500,
      fontSize: '0.75rem',
      lineHeight: 1.4,
      textTransform: 'uppercase',
      letterSpacing: '0.1em',
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          borderRadius: '12px',
          fontWeight: 600,
          fontSize: '1rem',
          padding: '12px 24px',
          transition: 'all 0.3s ease',
          '&:hover': {
            transform: 'translateY(-2px)',
            boxShadow: '0 8px 25px rgba(255, 107, 53, 0.3)',
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          backdropFilter: 'blur(20px)',
          background: darkMode ? 'rgba(45, 52, 54, 0.4)' : 'rgba(255, 255, 255, 0.6)',
          border: darkMode ? '1px solid rgba(255, 255, 255, 0.1)' : '1px solid rgba(0, 0, 0, 0.1)',
          borderRadius: '16px',
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: '12px',
            backgroundColor: darkMode ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)',
            '&:hover': {
              backgroundColor: darkMode ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.08)',
            },
            '&.Mui-focused': {
              backgroundColor: darkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
            },
          },
        },
      },
    },
    MuiLinearProgress: {
      styleOverrides: {
        root: {
          borderRadius: 4,
          overflow: 'hidden',
          // 👇 Opt‑out class for rare cases that must show square ends
          '&.noClip': { overflow: 'visible' },
        },
        bar: {
          borderRadius: 4,
        },
      },
    },
  },
});

// Export default theme for backward compatibility
export const theme = createAppTheme(true);

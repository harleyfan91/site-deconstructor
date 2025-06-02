
import React from 'react';
import { Box, Button, IconButton } from '@mui/material';
import { DarkMode, LightMode } from '@mui/icons-material';
import { Link } from 'react-router-dom';
import { NavigationItem } from './NavigationItems';

interface DesktopNavigationProps {
  navigationItems: NavigationItem[];
  darkMode: boolean;
  toggleDarkMode: () => void;
  onNavClick: (item: NavigationItem) => void;
}

const DesktopNavigation = ({ navigationItems, darkMode, toggleDarkMode, onNavClick }: DesktopNavigationProps) => {
  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
      {navigationItems.map((item) => (
        item.type === 'link' ? (
          <Button
            key={item.id}
            color="inherit"
            component={Link}
            to={item.id}
            sx={{
              '&:hover': {
                backgroundColor: 'rgba(255, 107, 53, 0.1)',
              },
            }}
          >
            {item.label}
          </Button>
        ) : (
          <Button
            key={item.id}
            color="inherit"
            onClick={() => onNavClick(item)}
            sx={{
              '&:hover': {
                backgroundColor: 'rgba(255, 107, 53, 0.1)',
              },
            }}
          >
            {item.label}
          </Button>
        )
      ))}
       {/* <IconButton color="inherit" onClick={toggleDarkMode}>
        {darkMode ? <LightMode /> : <DarkMode />}
      </IconButton> */}
      <Button
        variant="contained"
        sx={{
          background: 'linear-gradient(45deg, #FF6B35 30%, #FF8A65 90%)',
          boxShadow: '0 4px 15px rgba(255, 107, 53, 0.3)',
          '&:hover': {
            background: 'linear-gradient(45deg, #FF8A65 30%, #FF6B35 90%)',
          },
        }}
      >
        Get Started
      </Button>
    </Box>
  );
};

export default DesktopNavigation;

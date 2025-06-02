
import React, { useState } from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import { Link } from 'react-router-dom';
import { smoothScrollToSection } from '../lib/smoothScroll';
import DesktopNavigation from './navigation/DesktopNavigation';
import MobileDrawer from './navigation/MobileDrawer';
import { navigationItems, NavigationItem } from './navigation/NavigationItems';

const AppHeader = ({ darkMode, toggleDarkMode }: { darkMode: boolean; toggleDarkMode: () => void }) => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const handleNavClick = (item: NavigationItem) => {
    console.log('Nav clicked for:', item, 'isMobile:', isMobile, 'mobileOpen:', mobileOpen);
    
    if (item.type === 'link') {
      if (isMobile && mobileOpen) {
        setMobileOpen(false);
      }
      return;
    }

    if (isMobile && mobileOpen) {
      setMobileOpen(false);
      setTimeout(() => {
        console.log('Delayed scroll for mobile drawer');
        smoothScrollToSection(item.id);
      }, 300);
    } else {
      smoothScrollToSection(item.id);
      setMobileOpen(false);
    }
  };

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  return (
    <>
      <AppBar 
        position="fixed" 
        sx={{ 
          backdropFilter: 'blur(20px)',
          backgroundColor: 'rgba(0, 0, 0, 0.8)',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
        }}
      >
        <Toolbar>
          <Typography
            variant="h6"
            component={Link}
            to="/"
            sx={{
              flexGrow: 1,
              fontWeight: 700,
              background: 'linear-gradient(45deg, #FF6B35 30%, #0984E3 90%)',
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              textDecoration: 'none',
            }}
          >
            SiteDeconstructor
          </Typography>

          {!isMobile && (
            <DesktopNavigation
              navigationItems={navigationItems}
              darkMode={darkMode}
              toggleDarkMode={toggleDarkMode}
              onNavClick={handleNavClick}
            />
          )}

          {isMobile && (
            <MobileDrawer
              navigationItems={navigationItems}
              mobileOpen={mobileOpen}
              darkMode={darkMode}
              toggleDarkMode={toggleDarkMode}
              onDrawerToggle={handleDrawerToggle}
              onNavClick={handleNavClick}
            />
          )}
        </Toolbar>
      </AppBar>

      <Toolbar />
    </>
  );
};

export default AppHeader;

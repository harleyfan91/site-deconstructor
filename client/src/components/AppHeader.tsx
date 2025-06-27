
import React, { useState } from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { smoothScrollToSection, navigateAndScroll } from '../lib/smoothScroll';
import DesktopNavigation from './navigation/DesktopNavigation';
import MobileDrawer from './navigation/MobileDrawer';
import { navigationItems, NavigationItem } from './navigation/NavigationItems';
import { useAnalysisContext } from '../contexts/AnalysisContext';

const AppHeader = ({ darkMode, toggleDarkMode }: { darkMode: boolean; toggleDarkMode: () => void }) => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const navigate = useNavigate();
  const location = useLocation();
  const { data: analysisData } = useAnalysisContext();

  const handleNavClick = (item: NavigationItem) => {
    console.log('Nav clicked for:', item, 'isMobile:', isMobile, 'mobileOpen:', mobileOpen);
    
    if (item.type === 'link') {
      if (isMobile && mobileOpen) {
        setMobileOpen(false);
      }
      return;
    }

    // Handle scroll sections with cross-page navigation
    if (isMobile && mobileOpen) {
      setMobileOpen(false);
      setTimeout(() => {
        console.log('Delayed scroll for mobile drawer');
        navigateAndScroll(item.id, navigate, location.pathname);
      }, 300);
    } else {
      navigateAndScroll(item.id, navigate, location.pathname);
      setMobileOpen(false);
    }
  };

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const showUserIcon = !!analysisData;

  return (
    <>
      <AppBar 
        position="fixed" 
        sx={{ 
          backdropFilter: 'blur(20px)',
          backgroundColor: darkMode ? 'rgba(0, 0, 0, 0.8)' : 'rgba(255, 255, 255, 0.8)',
          boxShadow: darkMode ? '0 8px 32px rgba(0, 0, 0, 0.3)' : '0 8px 32px rgba(0, 0, 0, 0.1)',
          color: darkMode ? '#FFFFFF' : '#000000',
          // Further reduce header height so hero content can sit higher
          minHeight: { xs: 40, md: 48 },
        }}
      >
        <Toolbar
          sx={{
            // Reduce toolbar height to match the smaller header
            minHeight: { xs: 40, md: 48 },
            px: { xs: 2, md: 3 },
          }}
        >
          <Typography
            variant="h6"
            component={Link}
            to="/"
            sx={{
              flexGrow: 1,
              fontWeight: 700,
              textDecoration: 'none',
              // Slightly reduce font size
              fontSize: { xs: '1.1rem', md: '1.25rem' },
            }}
          >
            <span
              style={{
                background: 'linear-gradient(45deg, #FF6B35 30%, #0984E3 90%)',
                WebkitBackgroundClip: 'text',
                color: 'transparent',
                display: 'inline-block',
              }}
            >
              SiteDeconstructor
            </span>
          </Typography>

          {!isMobile && (
            <DesktopNavigation
              navigationItems={navigationItems}
              darkMode={darkMode}
              toggleDarkMode={toggleDarkMode}
              onNavClick={handleNavClick}
              showUserIcon={showUserIcon}
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
              showUserIcon={showUserIcon}
            />
          )}
        </Toolbar>
      </AppBar>

      {/* Reduce the spacing toolbar height to match the further reduced header */}
      <Toolbar
        sx={{
          minHeight: { xs: 40, md: 48 },
        }}
      />
    </>
  );
};

export default AppHeader;

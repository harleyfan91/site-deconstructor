import React, { useState } from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  IconButton,
  Drawer,
  List,
  ListItem,
  ListItemText,
  Box,
  useTheme,
  useMediaQuery,
  ListItemButton,
} from '@mui/material';
import { Menu, Close, DarkMode, LightMode } from '@mui/icons-material';
import { smoothScrollToSection } from '../lib/smoothScroll';

const AppHeader = ({ darkMode, toggleDarkMode }: { darkMode: boolean; toggleDarkMode: () => void }) => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const navigationItems = [
    { label: 'Features', id: 'features' },
    { label: 'Pricing', id: 'pricing' },
    { label: 'Dashboard', id: 'dashboard' }, // if you have this section
  ];

  const handleNavClick = (sectionId: string) => {
    console.log('Nav clicked for section:', sectionId, 'isMobile:', isMobile, 'mobileOpen:', mobileOpen);
    
    if (isMobile && mobileOpen) {
      // Close mobile menu first
      setMobileOpen(false);
      // Add delay to ensure drawer closes before scrolling
      setTimeout(() => {
        console.log('Delayed scroll for mobile drawer');
        smoothScrollToSection(sectionId);
      }, 300); // 300ms delay to match drawer close animation
    } else {
      // Desktop or mobile menu not open - scroll immediately
      smoothScrollToSection(sectionId);
      setMobileOpen(false); // Ensure mobile menu is closed
    }
  };

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const drawer = (
    <Box sx={{ width: 250, pt: 2 }}>
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', pr: 2, pb: 2 }}>
        <IconButton onClick={handleDrawerToggle} color="inherit">
          <Close />
        </IconButton>
      </Box>
      <List>
        {navigationItems.map((item) => (
          <ListItem key={item.id} disablePadding>
            <ListItemButton
              onClick={() => handleNavClick(item.id)}
              sx={{
                '&:hover': {
                  backgroundColor: 'rgba(255, 107, 53, 0.1)',
                },
              }}
            >
              <ListItemText 
                primary={item.label}
                sx={{
                  '& .MuiListItemText-primary': {
                    fontWeight: 500,
                  },
                }}
              />
            </ListItemButton>
          </ListItem>
        ))}
        <ListItem>
          <Button
            variant="contained"
            fullWidth
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
        </ListItem>
      </List>
    </Box>
  );

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
            component="div"
            sx={{
              flexGrow: 1,
              fontWeight: 700,
              background: 'linear-gradient(135deg, #FF6B35 0%, #FF8A65 100%)',
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            Website Deconstructor
          </Typography>

          {/* Desktop Navigation */}
          {!isMobile && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              {navigationItems.map((item) => (
                <Button
                  key={item.id}
                  color="inherit"
                  onClick={() => handleNavClick(item.id)}
                  sx={{
                    '&:hover': {
                      backgroundColor: 'rgba(255, 107, 53, 0.1)',
                    },
                  }}
                >
                  {item.label}
                </Button>
              ))}
              <IconButton color="inherit" onClick={toggleDarkMode}>
                {darkMode ? <LightMode /> : <DarkMode />}
              </IconButton>
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
          )}

          {/* Mobile Menu Button */}
          {isMobile && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <IconButton color="inherit" onClick={toggleDarkMode}>
                {darkMode ? <LightMode /> : <DarkMode />}
              </IconButton>
              <IconButton
                color="inherit"
                edge="start"
                onClick={handleDrawerToggle}
              >
                <Menu />
              </IconButton>
            </Box>
          )}
        </Toolbar>
      </AppBar>

      {/* Mobile Drawer */}
      <Drawer
        anchor="right"
        open={mobileOpen}
        onClose={handleDrawerToggle}
        ModalProps={{
          keepMounted: true, // Better open performance on mobile
        }}
        sx={{
          '& .MuiDrawer-paper': {
            backgroundImage: 'linear-gradient(135deg, rgba(0, 0, 0, 0.9) 0%, rgba(45, 52, 54, 0.95) 100%)',
            backdropFilter: 'blur(20px)',
          },
        }}
      >
        {drawer}
      </Drawer>

      {/* Spacer to account for fixed AppBar */}
      <Toolbar />
    </>
  );
};

export default AppHeader;

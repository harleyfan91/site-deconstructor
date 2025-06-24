
import React from 'react';
import {
  Drawer,
  List,
  ListItem,
  Button,
  Box,
  IconButton,
  ListItemText,
  ListItemButton,
} from '@mui/material';
import { Close, DarkMode, LightMode, AccountCircle } from '@mui/icons-material';
import { Link } from 'react-router-dom';
import { NavigationItem } from './NavigationItems';

interface MobileDrawerProps {
  navigationItems: NavigationItem[];
  mobileOpen: boolean;
  darkMode: boolean;
  toggleDarkMode: () => void;
  onDrawerToggle: () => void;
  onNavClick: (item: NavigationItem) => void;
  showUserIcon?: boolean;
}

const MobileDrawer: React.FC<MobileDrawerProps> = ({
  navigationItems,
  mobileOpen,
  darkMode,
  toggleDarkMode,
  onDrawerToggle,
  onNavClick,
  showUserIcon
}) => {
  const drawer = (
    <Box sx={{ width: 250, pt: 2, height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', pr: 2, pb: 2 }}>
        <IconButton onClick={onDrawerToggle} color="inherit">
          <Close />
        </IconButton>
      </Box>
      <List sx={{ flex: 1 }}>
        {navigationItems.map((item) => (
          <ListItem key={item.id} disablePadding>
            {item.type === 'link' ? (
              <ListItemButton
                component={Link}
                to={item.id}
                onClick={() => onNavClick(item)}
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
            ) : (
              <ListItemButton
                onClick={() => onNavClick(item)}
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
            )}
          </ListItem>
        ))}
        {!showUserIcon && (
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
        )}
      </List>
      
      {/* User icon positioned at bottom right */}
      {showUserIcon && (
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', p: 2 }}>
          <IconButton color="inherit">
            <AccountCircle />
          </IconButton>
        </Box>
      )}
    </Box>
  );

  return (
    <>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
         {/* <IconButton color="inherit" onClick={toggleDarkMode}>
          {darkMode ? <LightMode /> : <DarkMode />}
        </IconButton> */}
        <IconButton
          color="inherit"
          edge="start"
          onClick={onDrawerToggle}
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M3 12H21M3 6H21M3 18H21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </IconButton>
      </Box>

      <Drawer
        anchor="right"
        open={mobileOpen}
        onClose={onDrawerToggle}
        ModalProps={{
          keepMounted: true,
        }}
        sx={{
          '& .MuiDrawer-paper': {
            backgroundImage: darkMode 
              ? 'linear-gradient(135deg, rgba(0, 0, 0, 0.9) 0%, rgba(45, 52, 54, 0.95) 100%)'
              : 'linear-gradient(135deg, rgba(255, 255, 255, 0.9) 0%, rgba(245, 245, 245, 0.95) 100%)',
            backdropFilter: 'blur(20px)',
          },
        }}
      >
        {drawer}
      </Drawer>
    </>
  );
};

export default MobileDrawer;

import React from 'react';
import { Button, IconButton } from '@mui/material';
import { LogOut } from 'lucide-react';
import { supabase } from '../../lib/supabaseClient';

interface LogoutProps {
  variant?: 'button' | 'icon';
  onLogout?: () => void;
}

export function Logout({ variant = 'button', onLogout }: LogoutProps) {
  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      onLogout?.();
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  if (variant === 'icon') {
    return (
      <IconButton onClick={handleLogout} color="inherit" title="Sign out">
        <LogOut size={20} />
      </IconButton>
    );
  }

  return (
    <Button 
      onClick={handleLogout} 
      variant="outlined" 
      startIcon={<LogOut size={16} />}
      size="small"
    >
      Sign out
    </Button>
  );
}
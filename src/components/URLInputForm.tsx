
import React, { useState } from 'react';
import {
  TextField,
  Button,
  Box,
  InputAdornment,
  CircularProgress,
  Chip,
  Typography,
} from '@mui/material';
import { Search, Link as LinkIcon } from '@mui/icons-material';
import { motion } from 'framer-motion';

const URLInputForm = () => {
  const [url, setUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isValid, setIsValid] = useState(true);

  const recentSearches = [
    'apple.com',
    'stripe.com',
    'linear.app',
    'vercel.com',
  ];

  const validateUrl = (value: string) => {
    const urlPattern = /^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?$/;
    return urlPattern.test(value) || value === '';
  };

  const handleUrlChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    setUrl(value);
    setIsValid(validateUrl(value));
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    if (url && isValid) {
      setIsLoading(true);
      // Simulate API call
      setTimeout(() => {
        setIsLoading(false);
        console.log('Analyzing:', url);
      }, 2000);
    }
  };

  const handleRecentSearch = (searchUrl: string) => {
    setUrl(searchUrl);
    setIsValid(true);
  };

  return (
    <Box sx={{ width: '100%', maxWidth: 600 }}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.4 }}
      >
        <Box
          component="form"
          onSubmit={handleSubmit}
          sx={{
            display: 'flex',
            flexDirection: { xs: 'column', sm: 'row' },
            gap: 2,
            mb: 3,
          }}
        >
          <TextField
            fullWidth
            placeholder="Enter website URL (e.g., apple.com)"
            value={url}
            onChange={handleUrlChange}
            error={!isValid}
            helperText={!isValid ? 'Please enter a valid URL' : ''}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <LinkIcon color="action" />
                </InputAdornment>
              ),
              sx: {
                fontSize: '1.1rem',
                height: 56,
              },
            }}
            sx={{
              '& .MuiOutlinedInput-root': {
                transition: 'all 0.3s ease',
                '&:hover': {
                  transform: 'translateY(-1px)',
                  boxShadow: '0 4px 20px rgba(255, 107, 53, 0.1)',
                },
                '&.Mui-focused': {
                  transform: 'translateY(-1px)',
                  boxShadow: '0 4px 20px rgba(255, 107, 53, 0.2)',
                },
              },
            }}
          />
          <Button
            type="submit"
            variant="contained"
            size="large"
            disabled={!url || !isValid || isLoading}
            sx={{
              minWidth: { xs: '100%', sm: 150 },
              height: 56,
              background: 'linear-gradient(45deg, #0984E3 30%, #42A5F5 90%)',
              position: 'relative',
              overflow: 'hidden',
              '&::before': {
                content: '""',
                position: 'absolute',
                top: 0,
                left: '-100%',
                width: '100%',
                height: '100%',
                background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent)',
                transition: 'left 0.5s',
              },
              '&:hover::before': {
                left: '100%',
              },
            }}
          >
            {isLoading ? (
              <CircularProgress size={24} color="inherit" />
            ) : (
              <>
                <Search sx={{ mr: 1 }} />
                Analyze
              </>
            )}
          </Button>
        </Box>
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.6 }}
      >
        <Typography
          variant="body2"
          color="text.secondary"
          sx={{ mb: 2, textAlign: 'center' }}
        >
          Try these popular sites:
        </Typography>
        <Box
          sx={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: 1,
            justifyContent: 'center',
          }}
        >
          {recentSearches.map((search, index) => (
            <motion.div
              key={search}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3, delay: 0.7 + index * 0.1 }}
            >
              <Chip
                label={search}
                onClick={() => handleRecentSearch(search)}
                sx={{
                  bgcolor: 'rgba(255, 255, 255, 0.1)',
                  color: 'text.primary',
                  '&:hover': {
                    bgcolor: 'rgba(255, 107, 53, 0.2)',
                    transform: 'translateY(-2px)',
                  },
                  transition: 'all 0.3s ease',
                  cursor: 'pointer',
                }}
              />
            </motion.div>
          ))}
        </Box>
      </motion.div>
    </Box>
  );
};

export default URLInputForm;

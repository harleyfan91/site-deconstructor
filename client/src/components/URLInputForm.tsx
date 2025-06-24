import React, { useState } from 'react';
import {
  TextField,
  Button,
  Box,
  InputAdornment,
  CircularProgress,
  Alert,
} from '@mui/material';
import { Search, Link as LinkIcon } from '@mui/icons-material';
import { motion } from 'framer-motion';
import { useAnalysisContext } from '../contexts/AnalysisContext';

interface URLInputFormProps {
  onAnalysisComplete?: (result: any) => void;
}

const URLInputForm = ({ onAnalysisComplete }: URLInputFormProps) => {
  const [url, setUrl] = useState('');
  const [isValid, setIsValid] = useState(true);
  const { analyzeWebsite, loading, error } = useAnalysisContext();

  const validateUrl = (value: string) => {
    const urlPattern = /^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?$/i;
    return urlPattern.test(value) || value === '';
  };

  const handleUrlChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    setUrl(value);
    setIsValid(validateUrl(value));
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (url && isValid) {
      let fullUrl = url;
      if (!url.startsWith('http://') && !url.startsWith('https://')) {
        fullUrl = `https://${url}`;
      }
      const result = await analyzeWebsite(fullUrl);
      
      // Call the callback if analysis was successful and we're on the landing page
      if (result && !error && onAnalysisComplete) {
        onAnalysisComplete(result);
      }
    }
  };

  return (
    <Box 
      sx={{ 
        width: '100%', 
        maxWidth: 600,
        // Add custom CSS for slower scroll animation
        '& *': {
          scrollBehavior: 'smooth !important',
        }
      }}
    >
      {/* Add custom styles for slower scroll */}
      <style>
        {`
          html {
            scroll-behavior: smooth;
            scroll-padding-top: 0;
          }
          
          @media (prefers-reduced-motion: no-preference) {
            html {
              scroll-behavior: smooth;
            }
          }
        `}
      </style>
      
      {error && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        </motion.div>
      )}
      
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
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          whileHover={{ scale: 1.02 }}
          whileFocus={{ scale: 1.02 }}
          style={{ flex: 1 }}
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
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.1, ease: "easeOut" }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.98 }}
        >
          <Button
            type="submit"
            variant="contained"
            size="large"
            disabled={!url || !isValid || loading}
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
            {loading ? (
              <CircularProgress size={24} color="inherit" />
            ) : (
              <>
                <Search sx={{ mr: 1 }} />
                Analyze
              </>
            )}
          </Button>
        </motion.div>
      </Box>
    </Box>
  );
};

export default URLInputForm;

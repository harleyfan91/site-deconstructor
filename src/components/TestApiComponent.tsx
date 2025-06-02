
import React, { useState } from 'react';
import { Box, Button, TextField, Typography, Paper, CircularProgress, Alert } from '@mui/material';
import { useAnalysisApi } from '../hooks/useAnalysisApi';

const TestApiComponent = () => {
  const [testUrl, setTestUrl] = useState('https://example.com');
  const { analyzeWebsite, loading, error, data } = useAnalysisApi();

  const handleTest = async () => {
    await analyzeWebsite(testUrl);
  };

  return (
    <Paper sx={{ p: 3, mb: 3 }}>
      <Typography variant="h6" gutterBottom>
        API Test Component
      </Typography>
      
      <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
        <TextField
          fullWidth
          label="URL to analyze"
          value={testUrl}
          onChange={(e) => setTestUrl(e.target.value)}
          placeholder="https://example.com"
        />
        <Button 
          variant="contained" 
          onClick={handleTest}
          disabled={loading}
          sx={{ minWidth: 120 }}
        >
          {loading ? <CircularProgress size={24} /> : 'Test API'}
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {data && (
        <Box>
          <Typography variant="subtitle1" gutterBottom>
            ✅ API Test Successful!
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Analysis ID: {data.id}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            URL: {data.url}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Overall Score: {data.data.overview.overallScore}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Status: {data.status}
          </Typography>
        </Box>
      )}
    </Paper>
  );
};

export default TestApiComponent;

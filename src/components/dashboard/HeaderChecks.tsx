
import React from 'react';
import { Box, Typography, Alert, CircularProgress } from '@mui/material';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { useAnalysisContext } from '../../contexts/AnalysisContext';

const HeaderChecks = () => {
  const { data, loading, error } = useAnalysisContext();

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" py={4}>
        <CircularProgress />
        <Typography variant="body1" sx={{ ml: 2 }}>
          Analyzing security headers...
        </Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ mt: 2 }}>
        Error loading header checks data: {error}
      </Alert>
    );
  }

  const { hsts = 'missing', csp = 'missing', frameOptions = 'missing' } = data?.headerChecks || {};

  const getStatusColor = (value: string) => {
    if (value === 'missing' || value === 'error') return 'error';
    return 'success';
  };

  return (
    <Box>
      <Typography variant="h5" gutterBottom>
        Security Header Checks
      </Typography>
      
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Analysis of important security headers present in the HTTP response.
      </Typography>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Header</TableHead>
            <TableHead>Status</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <TableRow>
            <TableCell>
              <Typography variant="subtitle2">Strict-Transport-Security</Typography>
              <Typography variant="caption" color="text.secondary">
                Enforces HTTPS connections
              </Typography>
            </TableCell>
            <TableCell>
              <Typography 
                variant="body2" 
                color={getStatusColor(hsts) === 'error' ? 'error.main' : 'success.main'}
              >
                {hsts}
              </Typography>
            </TableCell>
          </TableRow>
          <TableRow>
            <TableCell>
              <Typography variant="subtitle2">Content-Security-Policy</Typography>
              <Typography variant="caption" color="text.secondary">
                Prevents XSS and code injection
              </Typography>
            </TableCell>
            <TableCell>
              <Typography 
                variant="body2" 
                color={getStatusColor(csp) === 'error' ? 'error.main' : 'success.main'}
              >
                {csp}
              </Typography>
            </TableCell>
          </TableRow>
          <TableRow>
            <TableCell>
              <Typography variant="subtitle2">X-Frame-Options</Typography>
              <Typography variant="caption" color="text.secondary">
                Prevents clickjacking attacks
              </Typography>
            </TableCell>
            <TableCell>
              <Typography 
                variant="body2" 
                color={getStatusColor(frameOptions) === 'error' ? 'error.main' : 'success.main'}
              >
                {frameOptions}
              </Typography>
            </TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </Box>
  );
};

export default HeaderChecks;

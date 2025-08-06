import React, { useState } from 'react';
import { 
  Box, 
  Container, 
  Typography, 
  Card, 
  CardContent, 
  Button, 
  Alert,
  TextField,
  Grid
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import AppHeader from '../components/AppHeader';
import { ScanProgressBar } from '../components/ScanProgressBar';

interface ProgressTestPageProps {
  darkMode: boolean;
  toggleDarkMode: () => void;
}

const ProgressTestPage = ({ darkMode, toggleDarkMode }: ProgressTestPageProps) => {
  const navigate = useNavigate();
  const [testScanId, setTestScanId] = useState('test-scan-' + Date.now());
  const [url, setUrl] = useState('https://example.com');

  const createTestScan = async () => {
    try {
      // Create a new test scan
      console.log('🌐 submitting scan', url);
      console.log('🌐 POST /api/scans', url);
      const response = await fetch('/api/scans', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url }),
      });
      console.log('🌐 submitting scan', url);

      console.log('📥 /api/scans status', response.status);
      const data = await response.json().catch(() => null);
      console.log('Scan creation response body:', data);

      if (response.ok && data?.scan_id) {
        const newScanId = data.scan_id;
        setTestScanId(newScanId);

        // Navigate to dashboard with the new scan ID
        navigate(`/dashboard/${newScanId}`);
      } else {
        alert('Failed to create scan. Make sure the server is running.');
      }
    } catch (error) {
      console.error('Error creating scan:', error);
      alert('Error creating scan. Check console for details.');
    }
  };

  const navigateToDashboard = () => {
    navigate(`/dashboard/${testScanId}`);
  };

  return (
    <Box>
      <AppHeader darkMode={darkMode} toggleDarkMode={toggleDarkMode} />
      
      <Container maxWidth="xl" sx={{ mt: 2, mb: 2, px: { xs: 1, sm: 2 } }}>
        <Box sx={{ mb: 3 }}>
          <Typography variant="h4" gutterBottom>
            Part 6 - Realtime Progress Bar Test
          </Typography>
          
          <Alert severity="info" sx={{ mb: 3 }}>
            <strong>Test Instructions:</strong>
            <br />1. Make sure the worker is running: <code>npm run worker:dev</code>
            <br />2. Create a new scan and watch the progress bar update in real-time
            <br />3. Progress should advance from 0% → 100% without page refresh
            <br />4. Status should change from "Queued" → "Analyzing" → "Complete"
          </Alert>

          <Grid container spacing={3}>
            {/* Test Controls */}
            <Grid component="div" size={{ xs: 12, md: 6 }}>
              <Card sx={{ p: 3 }}>
                <Typography variant="h6" gutterBottom>
                  Create Test Scan
                </Typography>
                
                <TextField
                  fullWidth
                  label="URL to Analyze"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  sx={{ mb: 2 }}
                />
                
                <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                  <Button 
                    variant="contained" 
                    onClick={createTestScan}
                    color="primary"
                  >
                    Create New Scan
                  </Button>
                  
                  <Button 
                    variant="outlined" 
                    onClick={navigateToDashboard}
                  >
                    View Current Scan
                  </Button>
                </Box>
                
                <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
                  Current Scan ID: <code>{testScanId}</code>
                </Typography>
              </Card>
            </Grid>

            {/* Live Progress Demo */}
            <Grid component="div" size={{ xs: 12, md: 6 }}>
              <Card sx={{ p: 3 }}>
                <Typography variant="h6" gutterBottom>
                  Live Progress Demo
                </Typography>
                
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  This progress bar updates via Supabase Realtime subscription
                </Typography>
                
                <ScanProgressBar scanId={testScanId} showDetails={true} />
                
                <Alert severity="success" sx={{ mt: 2 }} variant="outlined">
                  <strong>Realtime Features:</strong>
                  <br />• No polling needed - updates instantly
                  <br />• Fallback to polling if Realtime fails
                  <br />• Works across multiple browser tabs
                </Alert>
              </Card>
            </Grid>
          </Grid>

          {/* Technical Details */}
          <Card sx={{ mt: 3, p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Technical Implementation
            </Typography>
            
            <Typography variant="body2" color="text.secondary" paragraph>
              The <code>useScanProgress</code> hook subscribes to Supabase Realtime changes on the <code>scan_status</code> table.
              When the worker updates progress, the UI receives instant notifications without polling.
            </Typography>
            
            <Typography variant="body2" color="text.secondary">
              <strong>Key Features:</strong>
              <br />• Supabase Realtime subscription with automatic reconnection
              <br />• Graceful fallback to React Query polling if Realtime fails
              <br />• Real-time progress updates (0-100%) and status changes
              <br />• Cross-tab synchronization for consistent state
            </Typography>
          </Card>
        </Box>
      </Container>
    </Box>
  );
};

export default ProgressTestPage;
import React from 'react';
import { Box, Container, Typography, Card, CardContent, Button, Alert } from '@mui/material';
import { useLocation, useNavigate } from 'react-router-dom';
import AppHeader from '../components/AppHeader';
import UIAnalysisTab from '../components/dashboard/UIAnalysisTab';
import TechTab from '../components/dashboard/TechTab';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';

interface PanelTestPageProps {
  darkMode: boolean;
  toggleDarkMode: () => void;
}

const PanelTestPage = ({ darkMode, toggleDarkMode }: PanelTestPageProps) => {
  const navigate = useNavigate();
  const location = useLocation();
  const urlParams = new URLSearchParams(location.search);
  const testUrl = urlParams.get('url') || 'example.com';
  const scanId = urlParams.get('scanId') || 'test-scan-' + testUrl.replace(/[^a-zA-Z0-9]/g, '-');

  // Mock data for demonstration
  const mockData = {
    data: {
      ui: {
        colors: [
          { hex: '#007ACC', name: 'Primary Blue', usage: 'text', count: 15 },
          { hex: '#333333', name: 'Dark Gray', usage: 'background', count: 8 },
          { hex: '#FFFFFF', name: 'White', usage: 'background', count: 12 },
          { hex: '#FF6B35', name: 'Orange Accent', usage: 'button', count: 3 },
        ],
        fonts: [
          { family: 'Inter', weight: 400, size: '16px', usage: 'body' },
          { family: 'Inter', weight: 600, size: '24px', usage: 'heading' },
          { family: 'Roboto Mono', weight: 400, size: '14px', usage: 'code' },
        ],
        images: [
          { src: '/logo.png', alt: 'Logo', size: '2048x1024', type: 'photo' },
          { src: '/icon.svg', alt: 'Icon', size: '32x32', type: 'icon' },
        ],
        contrastIssues: [
          { textColor: '#999999', backgroundColor: '#FFFFFF', ratio: 2.1 },
        ],
        violations: [],
        accessibilityScore: 87,
      },
      tech: {
        techStack: [
          { name: 'React', confidence: 95, category: 'Framework' },
          { name: 'TypeScript', confidence: 90, category: 'Language' },
          { name: 'Vite', confidence: 85, category: 'Build Tool' },
        ],
        minification: { cssMinified: true, jsMinified: true },
      }
    }
  };

  const clearStorage = () => {
    localStorage.removeItem(`panelState:${scanId}`);
    window.location.reload();
  };

  const checkStorage = () => {
    const stored = localStorage.getItem(`panelState:${scanId}`);
    alert(`Current panel state for ${scanId}:\n${stored || 'No data stored'}`);
  };

  return (
    <Box>
      <AppHeader darkMode={darkMode} toggleDarkMode={toggleDarkMode} />
      
      <Container maxWidth="xl" sx={{ mt: 2, mb: 2, px: { xs: 1, sm: 2 } }}>
        <Box sx={{ mb: 3 }}>
          <Typography variant="h4" gutterBottom>
            Part 5 - Panel State Hook Test
          </Typography>
          <Alert severity="info" sx={{ mb: 2 }}>
            <strong>Test Instructions:</strong>
            <br />1. Expand 2-3 sections in the UI Analysis tab
            <br />2. Switch to Tech Analysis tab and back
            <br />3. Refresh the page - sections should remain expanded
            <br />4. Change URL parameter to test isolation
          </Alert>
          
          <Card sx={{ mb: 2, p: 2 }}>
            <Typography variant="h6" gutterBottom>Test Controls</Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              <strong>Test URL:</strong> {testUrl} | <strong>Scan ID:</strong> {scanId}
            </Typography>
            <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
              <Button 
                variant="outlined" 
                onClick={() => navigate(`/panel-test?url=google.com&scanId=test-google`)}
              >
                Test Different URL (google.com)
              </Button>
              <Button 
                variant="outlined" 
                onClick={() => navigate(`/panel-test?url=github.com&scanId=test-github`)}
              >
                Test Different URL (github.com)
              </Button>
              <Button variant="outlined" onClick={checkStorage}>
                Check Stored State
              </Button>
              <Button variant="outlined" color="warning" onClick={clearStorage}>
                Clear Storage & Reload
              </Button>
            </Box>
          </Card>
        </Box>

        <Tabs defaultValue="ui">
          <TabsList>
            <TabsTrigger value="ui">UI Analysis</TabsTrigger>
            <TabsTrigger value="tech">Tech Analysis</TabsTrigger>
          </TabsList>
          
          <TabsContent value="ui">
            <UIAnalysisTab 
              data={mockData} 
              loading={false} 
              error={null} 
              scanId={scanId}
            />
          </TabsContent>
          
          <TabsContent value="tech">
            <TechTab 
              data={mockData} 
              loading={false} 
              error={null} 
              scanId={scanId}
            />
          </TabsContent>
        </Tabs>
      </Container>
    </Box>
  );
};

export default PanelTestPage;
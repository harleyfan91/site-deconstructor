
import React, { useState } from 'react';
import { Box, Typography, Paper, Button, Menu, MenuItem } from '@mui/material';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import OverviewTab from './dashboard/OverviewTab';
import PerformanceTab from './dashboard/PerformanceTab';
import SEOAnalysisTab from './dashboard/SEOAnalysisTab';
import TechTab from './dashboard/TechTab';
import UIAnalysisTab from './dashboard/UIAnalysisTab';
import ComplianceTab from './dashboard/ComplianceTab';
import { useAnalysisContext } from '../contexts/AnalysisContext';
import { analysisToCsv, analysisToJSON } from '@/lib/export';
import { downloadFile } from '@/lib/utils';

const DashboardContent = () => {
  const { data: analysisData, loading, error } = useAnalysisContext();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const handleMenuOpen = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const exportCsv = () => {
    if (analysisData) {
      const csv = analysisToCsv(analysisData);
      downloadFile('analysis.csv', csv, 'text/csv');
    }
    handleMenuClose();
  };

  const exportJson = () => {
    if (analysisData) {
      const json = analysisToJSON(analysisData);
      downloadFile('analysis.json', json, 'application/json');
    }
    handleMenuClose();
  };

  return (
    <Box>
      <Typography variant="h4" component="h1" gutterBottom sx={{ fontWeight: 'bold', mb: 3 }}>
        Website Analysis Dashboard
      </Typography>
      
      <Paper elevation={3} sx={{ p: 3, borderRadius: 2 }}>
        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full grid-cols-6 mb-6">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="ui">User Interface</TabsTrigger>
            <TabsTrigger value="performance">Performance & Security</TabsTrigger>
            <TabsTrigger value="seo">SEO Analysis</TabsTrigger>
            <TabsTrigger value="tech">Tech</TabsTrigger>
            <TabsTrigger value="compliance">Compliance</TabsTrigger>
          </TabsList>
          
          <TabsContent value="overview">
            <OverviewTab data={analysisData} loading={loading} error={error} />
          </TabsContent>
          
          <TabsContent value="ui">
            <UIAnalysisTab data={analysisData} loading={loading} error={error} />
          </TabsContent>
          
          <TabsContent value="performance">
            <PerformanceTab data={analysisData} loading={loading} error={error} />
          </TabsContent>
          
          <TabsContent value="seo">
            <SEOAnalysisTab data={analysisData} loading={loading} error={error} />
          </TabsContent>
          
          <TabsContent value="tech">
            <TechTab data={analysisData} loading={loading} error={error} />
          </TabsContent>

          <TabsContent value="compliance">
            <ComplianceTab data={analysisData} loading={loading} error={error} />
          </TabsContent>
        </Tabs>

        <Box sx={{ mt: 4, textAlign: 'center' }}>
          <Button
            variant="contained"
            size="large"
            onClick={handleMenuOpen}
            sx={{
              width: '100%',
              maxWidth: 400,
              py: 2,
              background: 'linear-gradient(45deg, #FF6B35 30%, #FF8A65 90%)',
              boxShadow: '0 4px 15px rgba(255, 107, 53, 0.3)',
              '&:hover': {
                background: 'linear-gradient(45deg, #FF8A65 30%, #FF6B35 90%)',
              },
            }}
          >
            Export Report
          </Button>
          <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleMenuClose}>
            <MenuItem onClick={exportCsv}>Download CSV</MenuItem>
            <MenuItem onClick={exportJson}>Download JSON</MenuItem>
          </Menu>
        </Box>
      </Paper>
    </Box>
  );
};

export default DashboardContent;

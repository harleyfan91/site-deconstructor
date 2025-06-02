
import React, { useState } from 'react';
import { Box, Typography, Paper, Button } from '@mui/material';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import OverviewTab from './dashboard/OverviewTab';
import PerformanceTab from './dashboard/PerformanceTab';
import SEOAnalysisTab from './dashboard/SEOAnalysisTab';
import TechTab from './dashboard/TechTab';
import UIAnalysisTab from './dashboard/UIAnalysisTab';

const DashboardContent = () => {
  return (
    <Box>
      <Typography variant="h4" component="h1" gutterBottom sx={{ fontWeight: 'bold', mb: 3 }}>
        Website Analysis Dashboard
      </Typography>
      
      <Paper elevation={3} sx={{ p: 3, borderRadius: 2 }}>
        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full grid-cols-5 mb-6">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="ui">User Interface</TabsTrigger>
            <TabsTrigger value="performance">Performance</TabsTrigger>
            <TabsTrigger value="seo">SEO Analysis</TabsTrigger>
            <TabsTrigger value="tech">Tech</TabsTrigger>
          </TabsList>
          
          <TabsContent value="overview">
            <OverviewTab />
          </TabsContent>
          
          <TabsContent value="ui">
            <UIAnalysisTab />
          </TabsContent>
          
          <TabsContent value="performance">
            <PerformanceTab />
          </TabsContent>
          
          <TabsContent value="seo">
            <SEOAnalysisTab />
          </TabsContent>
          
          <TabsContent value="tech">
            <TechTab />
          </TabsContent>
        </Tabs>

        <Box sx={{ mt: 4, textAlign: 'center' }}>
          <Button
            variant="contained"
            size="large"
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
        </Box>
      </Paper>
    </Box>
  );
};

export default DashboardContent;


import React, { useState } from 'react';
import { Box, Typography, Paper } from '@mui/material';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import OverviewTab from './dashboard/OverviewTab';
import PerformanceTab from './dashboard/PerformanceTab';
import SEOAnalysisTab from './dashboard/SEOAnalysisTab';
import TechnicalTab from './dashboard/TechnicalTab';
import ContentAnalysisTab from './dashboard/ContentAnalysisTab';

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
            <TabsTrigger value="performance">Performance</TabsTrigger>
            <TabsTrigger value="seo">SEO Analysis</TabsTrigger>
            <TabsTrigger value="technical">Technical</TabsTrigger>
            <TabsTrigger value="content">Content</TabsTrigger>
          </TabsList>
          
          <TabsContent value="overview">
            <OverviewTab />
          </TabsContent>
          
          <TabsContent value="performance">
            <PerformanceTab />
          </TabsContent>
          
          <TabsContent value="seo">
            <SEOAnalysisTab />
          </TabsContent>
          
          <TabsContent value="technical">
            <TechnicalTab />
          </TabsContent>
          
          <TabsContent value="content">
            <ContentAnalysisTab />
          </TabsContent>
        </Tabs>
      </Paper>
    </Box>
  );
};

export default DashboardContent;

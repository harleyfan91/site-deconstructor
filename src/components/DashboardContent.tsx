
import React, { useState } from 'react';
import { Box, Typography, Paper, Button } from '@mui/material';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import OverviewTab from './dashboard/OverviewTab';
import PerformanceTab from './dashboard/PerformanceTab';
import SEOAnalysisTab from './dashboard/SEOAnalysisTab';
import TechTab from './dashboard/TechTab';
import UIAnalysisTab from './dashboard/UIAnalysisTab';
import ComplianceTab from './dashboard/ComplianceTab';
import { useAnalysisContext } from '../contexts/AnalysisContext';

const DashboardContent = () => {
  const { data: analysisData, loading, error } = useAnalysisContext();

  return (
    <Box>
      <Typography variant="h4" component="h1" gutterBottom sx={{ fontWeight: 'bold', mb: 3 }}>
        Website Analysis Dashboard
      </Typography>
      
      <Paper elevation={3} sx={{ p: 2, borderRadius: 2 }}>
        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full grid-cols-3 md:grid-cols-6 gap-1 mb-6 h-auto">
            <TabsTrigger value="overview" className="text-xs sm:text-sm">Overview</TabsTrigger>
            <TabsTrigger value="ui" className="text-xs sm:text-sm">User Interface</TabsTrigger>
            <TabsTrigger value="performance" className="text-xs sm:text-sm">Performance & Security</TabsTrigger>
            <TabsTrigger value="seo" className="text-xs sm:text-sm">SEO Analysis</TabsTrigger>
            <TabsTrigger value="tech" className="text-xs sm:text-sm">Tech</TabsTrigger>
            <TabsTrigger value="compliance" className="text-xs sm:text-sm">Compliance</TabsTrigger>
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


import React from 'react';
import { Box, Typography, Paper, Button } from '@mui/material';
import { motion } from 'framer-motion';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import OverviewTab from './dashboard/OverviewTab';
import PerformanceTab from './dashboard/PerformanceTab';
import SEOAnalysisTab from './dashboard/SEOAnalysisTab';
import TechTab from './dashboard/TechTab';
import UIAnalysisTab from './dashboard/UIAnalysisTab';
import ComplianceTab from './dashboard/ComplianceTab';
import { useAnalysisContext } from '../contexts/AnalysisContext';
import LegendContainer from './dashboard/LegendContainer';

const DashboardContent = () => {
  const { data: analysisData, loading, error } = useAnalysisContext();

  return (
    <Box>
      {/* HEADER ROW: Title (left), Legend (right), above nav bar */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.1 }}
      >
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            mb: 2,
            flexDirection: { xs: 'column', sm: 'row' },
            gap: { xs: 1, sm: 0 }
          }}
        >
          <Typography
            variant="h4"
            component="h1"
            gutterBottom
            sx={{ fontWeight: 'bold', mb: { xs: 0.5, sm: 0 } }}
          >
            Website Analysis Dashboard
          </Typography>
          <Box sx={{ ml: { xs: 0, sm: 2 }, mt: { xs: 1, sm: 0 }, alignSelf: { xs: 'stretch', sm: 'center' } }}>
            <LegendContainer />
          </Box>
        </Box>
      </motion.div>

      {/* Main dashboard content */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.3 }}
      >
        <Paper elevation={3} sx={{ p: { xs: 1.5, sm: 2 }, borderRadius: 2 }}>
          <Tabs defaultValue="overview" className="w-full">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              <TabsList className="grid w-full grid-cols-3 md:grid-cols-6 gap-1 mb-4 h-auto">
                <TabsTrigger value="overview" className="text-xs sm:text-sm">Overview</TabsTrigger>
                <TabsTrigger value="ui" className="text-xs sm:text-sm">User Interface</TabsTrigger>
                <TabsTrigger value="performance" className="text-xs sm:text-sm">Performance & Security</TabsTrigger>
                <TabsTrigger value="seo" className="text-xs sm:text-sm">SEO Analysis</TabsTrigger>
                <TabsTrigger value="tech" className="text-xs sm:text-sm">Tech</TabsTrigger>
                <TabsTrigger value="compliance" className="text-xs sm:text-sm">Compliance</TabsTrigger>
              </TabsList>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.5 }}
            >
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
            </motion.div>
          </Tabs>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
          >
            <Box sx={{ mt: 3, textAlign: 'center' }}>
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
          </motion.div>
        </Paper>
      </motion.div>
    </Box>
  );
};

export default DashboardContent;

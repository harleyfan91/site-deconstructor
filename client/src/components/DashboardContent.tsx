import React, { useState, useEffect, useCallback } from 'react';
import { Box, Typography, Paper, Button, Alert } from '@mui/material';
import { motion } from 'framer-motion';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { useAnalysisContext } from '../contexts/AnalysisContext';
import { useSessionState } from '../hooks/useSessionState';
import { useSectionLoading } from '../hooks/useSectionLoading';
import OverviewTab from './dashboard/OverviewTab';
import PerformanceTab from './dashboard/PerformanceTab';
import SEOAnalysisTab from './dashboard/SEOAnalysisTab';
import TechTab from './dashboard/TechTab';
import UIAnalysisTab from './dashboard/UIAnalysisTab';
import ComplianceTab from './dashboard/ComplianceTab';
import ContentAnalysisTab from './dashboard/ContentAnalysisTab';
import ExportModal from './export/ExportModal';
import URLInputForm from './URLInputForm';

const DashboardContent = () => {
  const { data: analysisData, loading, error } = useAnalysisContext();
  const sectionLoading = useSectionLoading(analysisData, loading);
  const [exportModalOpen, setExportModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const [visitedTabs, setVisitedTabs] = useSessionState('dashboard-visited-tabs', new Set(['overview']));
  
  // Ensure visitedTabs is always a Set
  const visitedTabsSet = visitedTabs instanceof Set ? visitedTabs : new Set(['overview']);
  const [backgroundLoadingStarted, setBackgroundLoadingStarted] = useState(false);

  const handleExportClick = () => {
    setExportModalOpen(true);
  };

  // Track visited tabs
  const handleTabChange = useCallback((value: string) => {
    setActiveTab(value);
    setVisitedTabs(prev => {
      const currentSet = prev instanceof Set ? prev : new Set(['overview']);
      return new Set([...Array.from(currentSet), value]);
    });
  }, [setVisitedTabs]);

  // Background loading: Start prefetching other data after overview is loaded and visible
  useEffect(() => {
    if (analysisData && !backgroundLoadingStarted && activeTab === 'overview') {
      setBackgroundLoadingStarted(true);

      // Delay background prefetching to allow overview to render smoothly
      const timer = setTimeout(() => {
        // Trigger any additional API calls that other tabs might need
        // For now, the main analysis already contains most data, 
        // but this is where you'd add calls for tab-specific data
        console.log('Background prefetching started for additional tab data');
      }, 1500);

      return () => clearTimeout(timer);
    }
  }, [analysisData, backgroundLoadingStarted, activeTab]);

  // Show URL input form only if we truly have no analysis data and we're not loading
  // Never show this during progressive loading when we have immediate data
  if (!analysisData && !loading) {
    return (
      <Box id="dashboard-root" data-dashboard="true">
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
              sx={{
                mb: { xs: 0.5, sm: 0 },
                whiteSpace: { xs: 'nowrap', sm: 'normal' },
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                maxWidth: { xs: '100vw', sm: 'none' },
              }}
            >
              Website Analysis Dashboard
            </Typography>
          </Box>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
        >
          <Paper elevation={3} sx={{ p: { xs: 3, sm: 4 }, borderRadius: 2, textAlign: 'center' }}>
            <Box sx={{ maxWidth: 600, mx: 'auto' }}>
              <Typography variant="h6" sx={{ mb: 2, color: 'text.secondary' }}>
                Enter a URL to analyze a website
              </Typography>
              
              <URLInputForm />
              
              {error && (
                <Alert severity="error" sx={{ mt: 2 }}>
                  {error}
                </Alert>
              )}
            </Box>
          </Paper>
        </motion.div>
      </Box>
    );
  }

  return (
    <Box id="dashboard-root" data-dashboard="true">
      {/* HEADER ROW: Title only, legend removed */}
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
            sx={{
              mb: { xs: 0.5, sm: 0 },
              whiteSpace: { xs: 'nowrap', sm: 'normal' },
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              maxWidth: { xs: '100vw', sm: 'none' },
            }}
          >
            Website Analysis Dashboard
          </Typography>
        </Box>
      </motion.div>

      {/* Main dashboard content */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.3 }}
      >
        <Paper elevation={3} sx={{ p: { xs: 1.5, sm: 2 }, borderRadius: 2 }}>
          <Tabs defaultValue="overview" className="w-full" value={activeTab} onValueChange={handleTabChange}>
            {/* Sticky navigation container */}
            <Box
              sx={{
                position: 'sticky',
                top: { xs: 40, md: 48 }, // Account for fixed header height
                zIndex: 10,
                backgroundColor: 'background.paper',
                pt: 1,
                pb: 1,
                mb: 2,
                borderBottom: '1px solid',
                borderColor: 'divider',
                borderRadius: '8px'
              }}
            >
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.4 }}
              >
                <TabsList className="grid w-full grid-cols-3 md:grid-cols-7 gap-1 h-auto">
                  <TabsTrigger value="overview" className="col-span-3 md:col-span-1 text-xs sm:text-sm" data-tab-id="overview">Overview</TabsTrigger>
                  <TabsTrigger value="ui" className="text-xs sm:text-sm" data-tab-id="ui">UI</TabsTrigger>
                  <TabsTrigger value="content" className="text-xs sm:text-sm" data-tab-id="content">Content</TabsTrigger>
                  <TabsTrigger value="performance" className="text-xs sm:text-sm" data-tab-id="performance">Performance</TabsTrigger>
                  <TabsTrigger value="seo" className="text-xs sm:text-sm" data-tab-id="seo">SEO</TabsTrigger>
                  <TabsTrigger value="tech" className="text-xs sm:text-sm" data-tab-id="tech">Tech</TabsTrigger>
                  <TabsTrigger value="compliance" className="text-xs sm:text-sm" data-tab-id="compliance">Compliance</TabsTrigger>
                </TabsList>
              </motion.div>
            </Box>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.5 }}
            >
              <TabsContent value="overview" data-tab-panel-id="overview" forceMount={visitedTabsSet.has('overview') || undefined}>
                <OverviewTab data={analysisData} loading={loading} error={error} />
              </TabsContent>

              <TabsContent value="ui" data-tab-panel-id="ui" forceMount={visitedTabsSet.has('ui') || undefined}>
                <UIAnalysisTab data={analysisData} loading={sectionLoading.ui} error={error} />
              </TabsContent>

              <TabsContent value="content" data-tab-panel-id="content" forceMount={visitedTabsSet.has('content') || undefined}>
                <ContentAnalysisTab data={analysisData} loading={sectionLoading.content} error={error} />
              </TabsContent>

              <TabsContent value="performance" data-tab-panel-id="performance" forceMount={visitedTabsSet.has('performance') || undefined}>
                <PerformanceTab data={analysisData} loading={sectionLoading.performance} error={error} />
              </TabsContent>

              <TabsContent value="seo" data-tab-panel-id="seo" forceMount={visitedTabsSet.has('seo') || undefined}>
                <SEOAnalysisTab data={analysisData} loading={sectionLoading.seo} error={error} />
              </TabsContent>

              <TabsContent value="tech" data-tab-panel-id="tech" forceMount={visitedTabsSet.has('tech') || undefined}>
                <TechTab data={analysisData} loading={sectionLoading.technical} error={error} />
              </TabsContent>

              <TabsContent value="compliance" data-tab-panel-id="compliance" forceMount={visitedTabsSet.has('compliance') || undefined}>
                <ComplianceTab data={analysisData} loading={sectionLoading.compliance} error={error} />
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
                onClick={handleExportClick}
                disabled={!analysisData || loading}
                sx={{
                  width: '100%',
                  maxWidth: 400,
                  py: 2,
                  background: 'linear-gradient(45deg, #FF6B35 30%, #FF8A65 90%)',
                  boxShadow: '0 4px 15px rgba(255, 107, 53, 0.3)',
                  '&:hover': {
                    background: 'linear-gradient(45deg, #FF8A65 30%, #FF6B35 90%)',
                  },
                  '&:disabled': {
                    background: 'rgba(0, 0, 0, 0.12)',
                    boxShadow: 'none',
                  },
                }}
              >
                Export Report
              </Button>
            </Box>
          </motion.div>
        </Paper>
      </motion.div>

      <ExportModal
        open={exportModalOpen}
        onClose={() => setExportModalOpen(false)}
        data={analysisData}
      />
    </Box>
  );
};

export default DashboardContent;
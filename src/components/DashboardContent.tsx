
import React, { useState } from 'react';
import { Box, Typography, Paper, Button } from '@mui/material';
import { motion } from 'framer-motion';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import OverviewTab from './dashboard/OverviewTab';
import PerformanceTab from './dashboard/PerformanceTab';
import SEOAnalysisTab from './dashboard/SEOAnalysisTab';
import TechTab from './dashboard/TechTab';
import UIAnalysisTab from './dashboard/UIAnalysisTab';
import ComplianceTab from './dashboard/ComplianceTab';
import ExportModal from './export/ExportModal';
import { useAnalysisContext } from '../contexts/AnalysisContext';

const DashboardContent = () => {
  const { data: analysisData, loading, error } = useAnalysisContext();
  const [exportModalOpen, setExportModalOpen] = useState(false);

  const handleExportClick = () => {
    setExportModalOpen(true);
  };

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
              fontWeight: 'bold',
              mb: { xs: 0.5, sm: 0 },
              fontSize: {
                xs: '1.6rem',
                sm: '2.1rem',
                md: '2.5rem'
              },
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
          <Tabs defaultValue="overview" className="w-full">
            {/* Sticky navigation container */}
            <Box
              sx={{
                position: 'sticky',
                top: { xs: 40, md: 48 }, // Account for fixed header height
                zIndex: 10,
                backgroundColor: 'background.paper',
                pt: 1,
                pb: 2,
                mb: 2,
                borderBottom: '1px solid',
                borderColor: 'divider',
              }}
            >
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.4 }}
              >
                <TabsList className="grid w-full grid-cols-3 md:grid-cols-6 gap-1 h-auto">
                  <TabsTrigger value="overview" className="text-xs sm:text-sm" data-tab-id="overview">Overview</TabsTrigger>
                  <TabsTrigger value="ui" className="text-xs sm:text-sm" data-tab-id="ui">User Interface</TabsTrigger>
                  <TabsTrigger value="performance" className="text-xs sm:text-sm" data-tab-id="performance">Performance & Security</TabsTrigger>
                  <TabsTrigger value="seo" className="text-xs sm:text-sm" data-tab-id="seo">SEO Analysis</TabsTrigger>
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
              <TabsContent value="overview" data-tab-panel-id="overview">
                <OverviewTab data={analysisData} loading={loading} error={error} />
              </TabsContent>
              
              <TabsContent value="ui" data-tab-panel-id="ui">
                <UIAnalysisTab data={analysisData} loading={loading} error={error} />
              </TabsContent>
              
              <TabsContent value="performance" data-tab-panel-id="performance">
                <PerformanceTab data={analysisData} loading={loading} error={error} />
              </TabsContent>
              
              <TabsContent value="seo" data-tab-panel-id="seo">
                <SEOAnalysisTab data={analysisData} loading={loading} error={error} />
              </TabsContent>
              
              <TabsContent value="tech" data-tab-panel-id="tech">
                <TechTab data={analysisData} loading={loading} error={error} />
              </TabsContent>

              <TabsContent value="compliance" data-tab-panel-id="compliance">
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

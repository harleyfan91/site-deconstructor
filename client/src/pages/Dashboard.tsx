import React, { useEffect } from 'react';
import { Box, Container, Grid, Typography, CircularProgress } from '@mui/material';
import { motion } from 'framer-motion';
import { useLocation, useParams } from 'react-router-dom';
import AppHeader from '../components/AppHeader';
import DashboardContent from '../components/DashboardContent';
import { TaskCard } from '../components/TaskCard';
import { useAnalysisContext } from '../contexts/AnalysisContext';
import { useScanStatus } from '../hooks/useScanStatus';
import { useTaskData } from '../hooks/useTaskData';
import { ScanProgressBar } from '../components/ScanProgressBar';

interface DashboardProps {
  darkMode: boolean;
  toggleDarkMode: () => void;
}

const Dashboard = ({ darkMode, toggleDarkMode }: DashboardProps) => {
  const location = useLocation();
  const { scanId } = useParams<{ scanId?: string }>();
  const { analyzeWebsite, data } = useAnalysisContext();

  // Task types for the new local-first architecture
  const taskTypes = ['tech', 'colors', 'seo', 'perf'] as const;

  // Hooks for the new scan-based architecture
  const { data: scanStatus, isLoading: scanStatusLoading } = useScanStatus(scanId || '');
  const techData = useTaskData(scanId || '', 'tech');
  const colorsData = useTaskData(scanId || '', 'colors');
  const seoData = useTaskData(scanId || '', 'seo');
  const perfData = useTaskData(scanId || '', 'perf');

  const taskHooks = {
    tech: techData,
    colors: colorsData,
    seo: seoData,
    perf: perfData,
  };

  useEffect(() => {
    // Fallback to legacy analysis if no scanId (backward compatibility)
    if (!scanId) {
      const urlParams = new URLSearchParams(location.search);
      const urlToAnalyze = urlParams.get('url');
      
      if (urlToAnalyze && !data) {
        console.log('🚀 Starting legacy analysis for URL parameter:', urlToAnalyze);
        analyzeWebsite(urlToAnalyze);
      }
    }
  }, [location.search, analyzeWebsite, data, scanId]);

  return (
    <Box>
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <AppHeader darkMode={darkMode} toggleDarkMode={toggleDarkMode} />
      </motion.div>
      
      <Container maxWidth="xl" sx={{ mt: 2, mb: 2, px: { xs: 1, sm: 2 } }}>
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          {scanId ? (
            // New scan-based dashboard with React-Query hooks
            <Box>
              {/* Scan Status Header with Progress Bar */}
              {scanId && (
                <Box sx={{ mb: 3, p: 3, backgroundColor: 'action.hover', borderRadius: 2 }}>
                  <Typography variant="h6" gutterBottom>
                    Analysis Progress
                  </Typography>
                  <ScanProgressBar scanId={scanId} showDetails={true} />
                  {scanStatus && (
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                      URL: {scanStatus.url}
                    </Typography>
                  )}
                </Box>
              )}

              {/* Task Cards Grid */}
              <Grid container spacing={3}>
                {taskTypes.map((taskType) => {
                  const hook = taskHooks[taskType];
                  return (
                    <Grid component="div" size={{ xs: 12, md: 6 }} key={taskType}>
                      <TaskCard
                        type={taskType}
                        data={hook.data}
                        isLoading={hook.isLoading}
                        error={hook.error}
                      />
                    </Grid>
                  );
                })}
              </Grid>
            </Box>
          ) : (
            // Legacy dashboard for backward compatibility
            <DashboardContent />
          )}
        </motion.div>
      </Container>
    </Box>
  );
};

export default Dashboard;

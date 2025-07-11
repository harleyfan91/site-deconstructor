import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  CircularProgress,
  Alert,
  Grid,
  Chip,
  IconButton,
  Tooltip
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { 
  Smartphone, 
  Tablet, 
  Monitor, 
  Eye,
  RefreshCw,
  CheckCircle,
  AlertTriangle,
  XCircle
} from 'lucide-react';

interface ResponsiveData {
  device: string;
  viewport: string;
  loading: boolean;
  screenshot?: string;
  metrics?: {
    loadTime: number;
    contentShifts: number;
    overflowIssues: number;
    readabilityScore: number;
    touchTargetIssues: number;
  };
  error?: string;
}

interface ResponsiveLayoutProbeProps {
  url?: string;
}

const ResponsiveLayoutProbe: React.FC<ResponsiveLayoutProbeProps> = ({ url }) => {
  const theme = useTheme();
  const [probeData, setProbeData] = useState<ResponsiveData[]>([]);
  const [isProbing, setIsProbing] = useState(false);

  const devices = [
    { name: 'Mobile', viewport: '375x667', icon: Smartphone },
    { name: 'Tablet', viewport: '768x1024', icon: Tablet },
    { name: 'Desktop', viewport: '1920x1080', icon: Monitor }
  ];

  const runResponsiveProbe = async () => {
    if (!url) return;

    setIsProbing(true);
    const initialData = devices.map(device => ({
      device: device.name,
      viewport: device.viewport,
      loading: true
    }));
    setProbeData(initialData);

    try {
      // Simulate responsive analysis - in real implementation this would call backend
      for (let i = 0; i < devices.length; i++) {
        const device = devices[i];
        
        // Simulate API call delay
        await new Promise(resolve => setTimeout(resolve, 2000 + i * 1000));
        
        // Simulate analysis results
        const mockMetrics = {
          loadTime: Math.floor(Math.random() * 3000) + 1000,
          contentShifts: Math.floor(Math.random() * 5),
          overflowIssues: Math.floor(Math.random() * 3),
          readabilityScore: Math.floor(Math.random() * 40) + 60,
          touchTargetIssues: device.name === 'Mobile' ? Math.floor(Math.random() * 8) : 0
        };

        setProbeData(prev => prev.map(item => 
          item.device === device.name 
            ? { 
                ...item, 
                loading: false, 
                metrics: mockMetrics,
                screenshot: `data:image/svg+xml;base64,${btoa(`
                  <svg width="200" height="150" xmlns="http://www.w3.org/2000/svg">
                    <rect width="100%" height="100%" fill="#f5f5f5"/>
                    <rect x="10" y="10" width="180" height="20" fill="#e0e0e0"/>
                    <rect x="10" y="40" width="120" height="15" fill="#e0e0e0"/>
                    <rect x="10" y="65" width="160" height="10" fill="#e0e0e0"/>
                    <rect x="10" y="85" width="140" height="10" fill="#e0e0e0"/>
                    <text x="100" y="125" text-anchor="middle" font-family="Arial" font-size="12" fill="#666">
                      ${device.name} Layout
                    </text>
                  </svg>
                `)}`
              }
            : item
        ));
      }
    } catch (error) {
      setProbeData(prev => prev.map(item => ({ 
        ...item, 
        loading: false, 
        error: 'Probe failed' 
      })));
    } finally {
      setIsProbing(false);
    }
  };

  const getMetricColor = (metric: string, value: number) => {
    switch (metric) {
      case 'loadTime':
        return value < 2000 ? theme.palette.success.main : 
               value < 4000 ? theme.palette.warning.main : theme.palette.error.main;
      case 'contentShifts':
      case 'overflowIssues':
      case 'touchTargetIssues':
        return value === 0 ? theme.palette.success.main :
               value < 3 ? theme.palette.warning.main : theme.palette.error.main;
      case 'readabilityScore':
        return value >= 80 ? theme.palette.success.main :
               value >= 60 ? theme.palette.warning.main : theme.palette.error.main;
      default:
        return theme.palette.text.primary;
    }
  };

  const getMetricIcon = (metric: string, value: number) => {
    const isGood = metric === 'readabilityScore' ? value >= 80 :
                   ['contentShifts', 'overflowIssues', 'touchTargetIssues'].includes(metric) ? value === 0 :
                   metric === 'loadTime' ? value < 2000 : true;
    
    if (isGood) return <CheckCircle size={16} color={theme.palette.success.main} />;
    if (metric === 'readabilityScore' ? value >= 60 : value < 3) return <AlertTriangle size={16} color={theme.palette.warning.main} />;
    return <XCircle size={16} color={theme.palette.error.main} />;
  };

  return (
    <Card sx={{ borderRadius: 2 }}>
      <CardContent sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Eye size={24} color={theme.palette.primary.main} style={{ marginRight: 8 }} />
            <Typography 
              variant="h6" 
              sx={{ 
                fontWeight: 'bold',
                fontSize: { xs: '1.1rem', sm: '1.25rem' }
              }}
            >
              Responsive Layout Probe
            </Typography>
          </Box>
          
          <Button
            variant="contained"
            size="small"
            startIcon={isProbing ? <CircularProgress size={16} color="inherit" /> : <RefreshCw size={16} />}
            onClick={runResponsiveProbe}
            disabled={!url || isProbing}
          >
            {isProbing ? 'Probing...' : 'Run Probe'}
          </Button>
        </Box>

        {!url && (
          <Alert severity="info">
            Enter a URL to probe responsive layout across devices
          </Alert>
        )}

        {url && probeData.length === 0 && (
          <Alert severity="info">
            Click "Run Probe" to test responsive layout across mobile, tablet, and desktop viewports
          </Alert>
        )}

        {probeData.length > 0 && (
          <Grid container spacing={3}>
            {probeData.map((device, index) => {
              const DeviceIcon = devices.find(d => d.name === device.device)?.icon || Monitor;
              
              return (
                <Grid item xs={12} md={4} key={device.device}>
                  <Card variant="outlined" sx={{ height: '100%' }}>
                    <CardContent sx={{ p: 2 }}>
                      {/* Device Header */}
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                        <DeviceIcon size={20} color={theme.palette.primary.main} style={{ marginRight: 8 }} />
                        <Box>
                          <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                            {device.device}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {device.viewport}
                          </Typography>
                        </Box>
                      </Box>

                      {/* Loading State */}
                      {device.loading && (
                        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', py: 3 }}>
                          <CircularProgress size={32} sx={{ mb: 2 }} />
                          <Typography variant="body2" color="text.secondary">
                            Analyzing {device.device.toLowerCase()} layout...
                          </Typography>
                        </Box>
                      )}

                      {/* Error State */}
                      {device.error && (
                        <Alert severity="error" sx={{ mt: 1 }}>
                          {device.error}
                        </Alert>
                      )}

                      {/* Results */}
                      {device.metrics && (
                        <Box>
                          {/* Screenshot Preview */}
                          {device.screenshot && (
                            <Box sx={{ 
                              mb: 2, 
                              textAlign: 'center',
                              '& img': {
                                maxWidth: '100%',
                                height: 'auto',
                                borderRadius: 1,
                                border: `1px solid ${theme.palette.divider}`
                              }
                            }}>
                              <img src={device.screenshot} alt={`${device.device} layout`} />
                            </Box>
                          )}

                          {/* Metrics */}
                          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                              <Typography variant="body2">Load Time</Typography>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                {getMetricIcon('loadTime', device.metrics.loadTime)}
                                <Typography variant="body2" sx={{ color: getMetricColor('loadTime', device.metrics.loadTime) }}>
                                  {device.metrics.loadTime}ms
                                </Typography>
                              </Box>
                            </Box>

                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                              <Typography variant="body2">Content Shifts</Typography>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                {getMetricIcon('contentShifts', device.metrics.contentShifts)}
                                <Typography variant="body2" sx={{ color: getMetricColor('contentShifts', device.metrics.contentShifts) }}>
                                  {device.metrics.contentShifts}
                                </Typography>
                              </Box>
                            </Box>

                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                              <Typography variant="body2">Overflow Issues</Typography>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                {getMetricIcon('overflowIssues', device.metrics.overflowIssues)}
                                <Typography variant="body2" sx={{ color: getMetricColor('overflowIssues', device.metrics.overflowIssues) }}>
                                  {device.metrics.overflowIssues}
                                </Typography>
                              </Box>
                            </Box>

                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                              <Typography variant="body2">Readability</Typography>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                {getMetricIcon('readabilityScore', device.metrics.readabilityScore)}
                                <Typography variant="body2" sx={{ color: getMetricColor('readabilityScore', device.metrics.readabilityScore) }}>
                                  {device.metrics.readabilityScore}%
                                </Typography>
                              </Box>
                            </Box>

                            {device.device === 'Mobile' && (
                              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <Typography variant="body2">Touch Targets</Typography>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                  {getMetricIcon('touchTargetIssues', device.metrics.touchTargetIssues)}
                                  <Typography variant="body2" sx={{ color: getMetricColor('touchTargetIssues', device.metrics.touchTargetIssues) }}>
                                    {device.metrics.touchTargetIssues} issues
                                  </Typography>
                                </Box>
                              </Box>
                            )}
                          </Box>
                        </Box>
                      )}
                    </CardContent>
                  </Card>
                </Grid>
              );
            })}
          </Grid>
        )}
      </CardContent>
    </Card>
  );
};

export default ResponsiveLayoutProbe;
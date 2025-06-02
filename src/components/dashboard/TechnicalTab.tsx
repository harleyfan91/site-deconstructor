
import React from 'react';
import { Box, Typography, Grid, Card, CardContent } from '@mui/material';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { Shield, Globe, Server, Database } from 'lucide-react';

const TechnicalTab = () => {
  const technicalChecks = [
    { category: 'Security', icon: Shield, score: '95%', status: 'Excellent' },
    { category: 'Accessibility', icon: Globe, score: '88%', status: 'Good' },
    { category: 'Server Response', icon: Server, score: '92%', status: 'Excellent' },
    { category: 'Database', icon: Database, score: '85%', status: 'Good' },
  ];

  const technicalIssues = [
    { type: 'Error', description: 'Mixed content warning on contact form', severity: 'Low', status: 'Open' },
    { type: 'Warning', description: 'Large DOM size detected', severity: 'Medium', status: 'In Progress' },
    { type: 'Info', description: 'HTTP/2 not enabled', severity: 'Low', status: 'Resolved' },
    { type: 'Error', description: 'Missing security headers', severity: 'High', status: 'Open' },
  ];

  const getSeverityColor = (severity: string) => {
    switch (severity.toLowerCase()) {
      case 'high': return '#F44336';
      case 'medium': return '#FF9800';
      case 'low': return '#4CAF50';
      default: return '#757575';
    }
  };

  return (
    <Box>
      <Typography variant="h5" gutterBottom sx={{ fontWeight: 'bold', mb: 3 }}>
        Technical Analysis
      </Typography>

      <Grid container spacing={3} sx={{ mb: 3 }}>
        {technicalChecks.map((check, index) => {
          const IconComponent = check.icon;
          return (
            <Grid item xs={12} sm={6} md={3} key={index}>
              <Card sx={{ borderRadius: 2, height: '100%' }}>
                <CardContent sx={{ p: 3, textAlign: 'center' }}>
                  <Box sx={{ mb: 2 }}>
                    <IconComponent size={32} color="#2196F3" />
                  </Box>
                  <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 1 }}>
                    {check.score}
                  </Typography>
                  <Typography variant="subtitle1" gutterBottom>
                    {check.category}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {check.status}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          );
        })}
      </Grid>

      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          <Card sx={{ borderRadius: 2 }}>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
                Technical Issues
              </Typography>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Type</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Severity</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {technicalIssues.map((issue, index) => (
                    <TableRow key={index}>
                      <TableCell>{issue.type}</TableCell>
                      <TableCell>{issue.description}</TableCell>
                      <TableCell>
                        <Box
                          sx={{
                            display: 'inline-block',
                            px: 2,
                            py: 0.5,
                            borderRadius: 1,
                            backgroundColor: `${getSeverityColor(issue.severity)}20`,
                            color: getSeverityColor(issue.severity),
                            fontSize: '0.875rem',
                            fontWeight: 'medium'
                          }}
                        >
                          {issue.severity}
                        </Box>
                      </TableCell>
                      <TableCell>{issue.status}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card sx={{ borderRadius: 2 }}>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
                Technical Health
              </Typography>
              <Box sx={{ mb: 3 }}>
                <Typography variant="h3" sx={{ fontWeight: 'bold', color: '#4CAF50', textAlign: 'center' }}>
                  B+
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center' }}>
                  Good Technical Health
                </Typography>
              </Box>
              
              <Box>
                <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mb: 2 }}>
                  Key Metrics
                </Typography>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="body2">SSL Grade</Typography>
                  <Typography variant="body2" sx={{ fontWeight: 'bold', color: '#4CAF50' }}>A+</Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="body2">Uptime</Typography>
                  <Typography variant="body2" sx={{ fontWeight: 'bold' }}>99.8%</Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="body2">Response Time</Typography>
                  <Typography variant="body2" sx={{ fontWeight: 'bold' }}>245ms</Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default TechnicalTab;


import React from 'react';
import {
  Box,
  Container,
  Typography,
  Grid2 as Grid,
  Card,
  CardContent,
} from '@mui/material';
import {
  Palette,
  TextFields,
  Image,
  Code,
  Speed,
  Security,
  Analytics,
  CloudDownload,
} from '@mui/icons-material';
import { motion } from 'framer-motion';

const FeatureShowcase = () => {
  const features = [
    {
      icon: <Palette />,
      title: 'Color Extraction',
      description: 'Extract dominant colors, gradients, and complete color palettes with hex codes.',
    },
    {
      icon: <TextFields />,
      title: 'Font Analysis',
      description: 'Identify fonts, typography styles, and text hierarchies used across the site.',
    },
    {
      icon: <Image />,
      title: 'Image Gallery',
      description: 'Catalog all images, icons, and visual assets with download capabilities.',
    },
    {
      icon: <Code />,
      title: 'Tech Stack Detection',
      description: 'Discover frameworks, libraries, and technologies powering the website.',
    },
    {
      icon: <Speed />,
      title: 'Performance Metrics',
      description: 'Analyze loading speeds, optimization scores, and performance insights.',
    },
    {
      icon: <Security />,
      title: 'Security Analysis',
      description: 'Check SSL certificates, security headers, and vulnerability assessments.',
    },
    {
      icon: <Analytics />,
      title: 'SEO Insights',
      description: 'Meta tags, structured data, and search optimization analysis.',
    },
    {
      icon: <CloudDownload />,
      title: 'Export Reports',
      description: 'Download comprehensive reports in PDF, JSON, or CSV formats.',
    },
  ];

  return (
    <Box sx={{ py: { xs: 8, md: 12 }, bgcolor: 'rgba(0, 0, 0, 0.2)' }}>
      <Container maxWidth="lg">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
        >
          <Typography
            variant="h2"
            align="center"
            sx={{
              mb: 2,
              background: 'linear-gradient(135deg, #FFFFFF 0%, rgba(255, 255, 255, 0.8) 100%)',
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            Powerful Analysis Tools
          </Typography>
          <Typography
            variant="h6"
            align="center"
            color="text.secondary"
            sx={{ mb: 8, maxWidth: 600, mx: 'auto' }}
          >
            Everything you need to understand and deconstruct any website's design and technology.
          </Typography>
        </motion.div>

        <Grid container spacing={4}>
          {features.map((feature, index) => (
            <Grid xs={12} sm={6} md={3} key={index}>
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                whileHover={{ y: -10 }}
              >
                <Card
                  sx={{
                    height: '100%',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      transform: 'translateY(-8px)',
                      boxShadow: '0 12px 40px rgba(255, 107, 53, 0.2)',
                      '& .feature-icon': {
                        color: 'primary.main',
                        transform: 'scale(1.1)',
                      },
                    },
                  }}
                >
                  <CardContent sx={{ p: 3, textAlign: 'center' }}>
                    <Box
                      className="feature-icon"
                      sx={{
                        color: 'text.secondary',
                        mb: 2,
                        transition: 'all 0.3s ease',
                        '& .MuiSvgIcon-root': {
                          fontSize: '3rem',
                        },
                      }}
                    >
                      {feature.icon}
                    </Box>
                    <Typography
                      variant="h6"
                      sx={{ mb: 2, fontWeight: 600 }}
                    >
                      {feature.title}
                    </Typography>
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{ lineHeight: 1.6 }}
                    >
                      {feature.description}
                    </Typography>
                  </CardContent>
                </Card>
              </motion.div>
            </Grid>
          ))}
        </Grid>
      </Container>
    </Box>
  );
};

export default FeatureShowcase;

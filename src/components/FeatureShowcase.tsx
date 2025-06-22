
import React from 'react';
import { Box, Container, Typography } from '@mui/material';
// MUI icons used for features
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
// Refactored feature card subcomponent for clarity and reusability
import FeatureCard from './FeatureCard';

/**
 * Static list of features to render as cards.
 * Each feature has an icon, title, and description.
 */
const features = [
  {
    icon: <Palette />,
    title: 'Color Extraction',
    description:
      'Extract dominant colors, gradients, and complete color palettes with hex codes.',
  },
  {
    icon: <TextFields />,
    title: 'Font Analysis',
    description:
      'Identify fonts, typography styles, and text hierarchies used across the site.',
  },
  {
    icon: <Image />,
    title: 'Image Gallery',
    description:
      'Catalog all images, icons, and visual assets with download capabilities.',
  },
  {
    icon: <Code />,
    title: 'Tech Stack Detection',
    description:
      'Discover frameworks, libraries, and technologies powering the website.',
  },
  {
    icon: <Speed />,
    title: 'Performance Metrics',
    description:
      'Analyze loading speeds, optimization scores, and performance insights.',
  },
  {
    icon: <Security />,
    title: 'Security Analysis',
    description:
      'Check SSL certificates, security headers, and vulnerability assessments.',
  },
  {
    icon: <Analytics />,
    title: 'SEO Insights',
    description:
      "Meta tags, structured data, and search optimization analysis.",
  },
  {
    icon: <CloudDownload />,
    title: 'Export Reports',
    description:
      'Download comprehensive reports in PDF, JSON, or CSV formats.',
  },
];

/**
 * Renders the grid of feature cards with animations and introductory text.
 * Card size and layout are fully responsive via MUI and CSS grid.
 */
const FeatureShowcase = () => {
  return (
    <Box
      id="features"
      sx={{
        position: 'relative',
        py: { xs: 8, md: 12 },
        bgcolor: 'transparent',
        // Masked/gradient background is rendered as absolute below
      }}
    >
      {/* Floating decorative shapes */}
      <motion.div
        animate={{
          y: [0, -15, 0],
          rotate: [0, 3, 0],
        }}
        transition={{
          duration: 7,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        style={{
          position: 'absolute',
          top: '15%',
          left: '8%',
          width: 50,
          height: 50,
          background: 'linear-gradient(45deg, #0984E3, #42A5F5)',
          borderRadius: '50%',
          opacity: 0.12,
          zIndex: 0,
        }}
      />
      <motion.div
        animate={{
          y: [0, 18, 0],
          rotate: [0, -4, 0],
        }}
        transition={{
          duration: 9,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 3,
        }}
        style={{
          position: 'absolute',
          bottom: '25%',
          right: '12%',
          width: 70,
          height: 70,
          background: 'linear-gradient(45deg, #FF6B35, #FF8A65)',
          borderRadius: '16px',
          opacity: 0.1,
          zIndex: 0,
        }}
      />

      {/* Masked/gradient background, absolutely positioned and masked */}
      <Box
        sx={{
          position: 'absolute',
          inset: 0,
          zIndex: 0,
          bgcolor: 'rgba(0, 0, 0, 0.2)',
          WebkitMaskImage: `linear-gradient(
            to bottom, 
            transparent 0%, 
            black 18%, 
            black 82%, 
            transparent 100%
          )`,
          maskImage: `linear-gradient(
            to bottom, 
            transparent 0%, 
            black 18%, 
            black 82%, 
            transparent 100%
          )`,
          maskSize: '100% 100%',
          WebkitMaskSize: '100% 100%',
          maskRepeat: 'no-repeat',
          WebkitMaskRepeat: 'no-repeat',
        }}
      />
      <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 1 }}>
        {/* Title and intro, animated */}
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
              zIndex: 2,
              position: 'relative',
            }}
          >
            Powerful Analysis Tools
          </Typography>
          <Typography
            variant="h6"
            align="center"
            color="text.secondary"
            sx={{ mb: 8, maxWidth: 600, mx: 'auto', zIndex: 2, position: 'relative' }}
          >
            Everything you need to understand and deconstruct any website's design and technology.
          </Typography>
        </motion.div>
        {/* Feature grid */}
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: {
              xs: 'repeat(2, 1fr)',
              sm: 'repeat(2, 1fr)',
              md: 'repeat(4, 1fr)',
            },
            gap: {
              xs: 2,
              sm: 4,
            },
            zIndex: 2,
            position: 'relative',
            alignItems: 'stretch',
          }}
        >
          {features.map((feature, index) => (
            <FeatureCard
              key={feature.title}
              icon={feature.icon}
              title={feature.title}
              description={feature.description}
              hoverDelay={index}
            />
          ))}
        </Box>
      </Container>
    </Box>
  );
};

export default FeatureShowcase;

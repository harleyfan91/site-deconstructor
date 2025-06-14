
import React from 'react';
import {
  Box,
  Container,
  Typography,
} from '@mui/material';
import { motion } from 'framer-motion';
import PricingCard from './pricing/PricingCard';
import { pricingPlans } from './pricing/PricingPlan';

const PricingSection = () => {
  return (
    <Box
      id="pricing"
      sx={{
        position: 'relative',
        py: { xs: 8, md: 12 },
        bgcolor: 'background.default',
        overflow: 'hidden',
      }}
    >
      {/* Upside-down colorful background fade */}
      <Box
        sx={{
          pointerEvents: 'none',
          position: 'absolute',
          left: 0,
          top: 0,
          width: '100%',
          height: { xs: 200, md: 340 },
          zIndex: 1,
          background: `
            linear-gradient(to bottom, #000 0%, rgba(0,0,0,0.8) 10%, rgba(0,0,0,0) 38%),
            radial-gradient(circle at 80% 80%, rgba(9, 132, 227, 0.25) 0%, transparent 55%),
            radial-gradient(circle at 25% 70%, rgba(255, 107, 53, 0.28) 0%, transparent 55%),
            radial-gradient(circle at 55% 30%, rgba(255, 138, 101, 0.22) 0%, transparent 65%),
            linear-gradient(225deg, #0F0F0F 0%, #1A1A1A 100%)
          `,
        }}
      />

      <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 2 }}>
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
              background: 'linear-gradient(135deg, #FF6B35 0%, #FF8A65 100%)',
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              fontWeight: 700,
            }}
          >
            Simple Pricing
          </Typography>
          <Typography
            variant="h6"
            align="center"
            color="text.secondary"
            sx={{ mb: 8, maxWidth: 600, mx: 'auto' }}
          >
            Start for free, upgrade when you need more features.
            <br />
            No monthly subscriptions.
          </Typography>
        </motion.div>

        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: {
              xs: '1fr',
              md: 'repeat(2, 1fr)',
            },
            gap: 4,
            maxWidth: 800,
            mx: 'auto',
            mt: 2,
          }}
        >
          {pricingPlans.map((plan, index) => (
            <PricingCard key={index} plan={plan} index={index} />
          ))}
        </Box>
      </Container>
    </Box>
  );
};

export default PricingSection;


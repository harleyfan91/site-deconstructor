
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
  // Reverse the order so Pro comes first (left on desktop, top on mobile)
  const plans = [...pricingPlans].reverse();

  return (
    <Box
      id="pricing"
      sx={{
        position: 'relative',
        py: { xs: 8, md: 12 },
        bgcolor: 'transparent',
        overflow: 'hidden',
        minHeight: { xs: 600, md: 780 },
      }}
    >
      {/* Floating decorative shapes */}
      <motion.div
        animate={{
          y: [0, 15, 0],
          rotate: [0, 4, 0],
        }}
        transition={{
          duration: 10,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 2,
        }}
        style={{
          position: 'absolute',
          top: '25%',
          left: '5%',
          width: 75,
          height: 75,
          background: 'linear-gradient(45deg, #0984E3, #42A5F5)',
          borderRadius: '50%',
          opacity: 0.09,
          zIndex: 0,
        }}
      />
      <motion.div
        animate={{
          y: [0, -22, 0],
          rotate: [0, -6, 0],
        }}
        transition={{
          duration: 7,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 5,
        }}
        style={{
          position: 'absolute',
          bottom: '20%',
          right: '8%',
          width: 55,
          height: 55,
          background: 'linear-gradient(45deg, #FF6B35, #FF8A65)',
          borderRadius: '16px',
          opacity: 0.11,
          zIndex: 0,
        }}
      />

      {/* Decorative background absolutely positioned with zIndex: 0 */}
      <Box
        sx={{
          pointerEvents: 'none',
          position: 'absolute',
          left: 0,
          top: 0,
          width: '100%',
          height: '100%',
          zIndex: 0,
          background: `
            radial-gradient(circle at 18% 82%, rgba(9,132,227,0.32) 0%, transparent 72%),
            radial-gradient(circle at 80% 75%, rgba(255,107,53,0.27) 0%, transparent 68%),
            radial-gradient(circle at 38% 30%, rgba(255,138,101,0.19) 0%, transparent 82%),
            linear-gradient(225deg, #0F0F0F 0%, #1A1A1A 100%)
          `,
          WebkitMaskImage: 'linear-gradient(to bottom, transparent 0%, black 20%, black 100%)',
          maskImage: 'linear-gradient(to bottom, transparent 0%, black 20%, black 100%)',
          maskSize: '100% 100%',
          WebkitMaskSize: '100% 100%',
          maskRepeat: 'no-repeat',
          WebkitMaskRepeat: 'no-repeat',
        }}
      />
      <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 1 }}>
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
              zIndex: 2,
              position: 'relative',
            }}
          >
            Simple Pricing
          </Typography>
          <Typography
            variant="h6"
            align="center"
            color="text.secondary"
            sx={{ mb: 8, maxWidth: 600, mx: 'auto', zIndex: 2, position: 'relative' }}
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
            zIndex: 2,
            position: 'relative',
          }}
        >
          {plans.map((plan, index) => (
            <PricingCard key={index} plan={plan} index={index} />
          ))}
        </Box>
      </Container>
    </Box>
  );
};
export default PricingSection;

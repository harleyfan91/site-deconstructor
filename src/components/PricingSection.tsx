
import React from 'react';
import {
  Box,
  Container,
  Typography,
  Card,
  CardContent,
  Button,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Chip,
} from '@mui/material';
import { Check, Star } from '@mui/icons-material';
import { motion } from 'framer-motion';

const PricingSection = () => {
  const pricingPlans = [
    {
      title: 'Basic',
      price: 'Free',
      description: 'For individuals and small teams to get started.',
      features: [
        'Limited color palette extraction',
        'Basic font analysis',
        'Up to 5 website scans per month',
      ],
      cta: 'Get Started',
    },
    {
      title: 'Pro',
      price: '$19.99',
      priceNote: 'One-time payment',
      description: 'Advanced features for designers and developers.',
      features: [
        'Unlimited color palette extraction',
        'Advanced font analysis',
        'Unlimited website scans',
        'Tech stack detection',
        'Performance metrics',
        'Security analysis',
        'SEO insights',
        'Export reports',
      ],
      cta: 'Upgrade to Pro',
      recommended: true,
    },
  ];

  return (
    <Box id="pricing" sx={{ py: { xs: 8, md: 12 }, bgcolor: 'background.default' }}>
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
            Start for free, upgrade when you need more features. No monthly subscriptions.
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
          }}
        >
          {pricingPlans.map((plan, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              viewport={{ once: true }}
              whileHover={{ y: -10 }}
              style={{
                // Add margin top for recommended cards to accommodate the floating chip
                marginTop: plan.recommended ? '16px' : '0px',
              }}
            >
              <Card
                sx={{
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  border: plan.recommended ? '2px solid #FF6B35' : '1px solid rgba(255, 255, 255, 0.1)',
                  position: 'relative',
                  overflow: 'visible', // Allow content to overflow for the floating chip
                  '&:hover': {
                    transform: 'translateY(-8px)',
                    boxShadow: '0 12px 40px rgba(255, 107, 53, 0.2)',
                  },
                }}
              >
                {plan.recommended && (
                  <Chip
                    icon={<Star />}
                    label="Recommended"
                    color="primary"
                    sx={{
                      position: 'absolute',
                      top: -16, // Float above the card
                      left: '50%',
                      transform: 'translateX(-50%)',
                      fontWeight: 600,
                      zIndex: 2,
                      boxShadow: '0 4px 12px rgba(255, 107, 53, 0.3)', // Add shadow for depth
                    }}
                  />
                )}
                <CardContent sx={{ p: 3, textAlign: 'center' }}>
                  <Typography
                    variant="h5"
                    sx={{ mb: 2, fontWeight: 600 }}
                  >
                    {plan.title}
                  </Typography>
                  <Typography
                    variant="h3"
                    sx={{ mb: 1, fontWeight: 700 }}
                  >
                    {plan.price}
                  </Typography>
                  {plan.priceNote && (
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{ mb: 2 }}
                    >
                      {plan.priceNote}
                    </Typography>
                  )}
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ mb: 3, lineHeight: 1.6 }}
                  >
                    {plan.description}
                  </Typography>
                  <List>
                    {plan.features.map((feature, i) => (
                      <ListItem key={i} disablePadding>
                        <ListItemIcon sx={{ minWidth: '30px' }}>
                          <Check color="primary" />
                        </ListItemIcon>
                        <ListItemText primary={feature} />
                      </ListItem>
                    ))}
                  </List>
                </CardContent>
                <Box sx={{ p: 3, textAlign: 'center' }}>
                  <Button
                    variant="contained"
                    color="primary"
                    fullWidth
                    sx={{
                      background: 'linear-gradient(45deg, #FF6B35 30%, #FF8A65 90%)',
                      boxShadow: '0 4px 15px rgba(255, 107, 53, 0.3)',
                      '&:hover': {
                        background: 'linear-gradient(45deg, #FF8A65 30%, #FF6B35 90%)',
                      },
                    }}
                  >
                    {plan.cta}
                  </Button>
                </Box>
              </Card>
            </motion.div>
          ))}
        </Box>
      </Container>
    </Box>
  );
};

export default PricingSection;

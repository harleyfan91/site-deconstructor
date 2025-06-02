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
      price: '$19/month',
      description: 'Advanced features for designers and developers.',
      features: [
        'Unlimited color palette extraction',
        'Advanced font analysis',
        'Unlimited website scans',
        'Tech stack detection',
      ],
      cta: 'Upgrade to Pro',
    },
    {
      title: 'Enterprise',
      price: 'Contact Us',
      description: 'Custom solutions for large organizations.',
      features: [
        'All Pro features',
        'Dedicated support',
        'Custom reporting',
        'Security analysis',
      ],
      cta: 'Contact Us',
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
            Flexible Pricing Plans
          </Typography>
          <Typography
            variant="h6"
            align="center"
            color="text.secondary"
            sx={{ mb: 8, maxWidth: 600, mx: 'auto' }}
          >
            Choose the plan that best fits your needs. Upgrade or downgrade at any time.
          </Typography>
        </motion.div>

        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: {
              xs: '1fr',
              md: 'repeat(3, 1fr)',
            },
            gap: 4,
          }}
        >
          {pricingPlans.map((plan, index) => (
            <Box key={index}>
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
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      transform: 'translateY(-8px)',
                      boxShadow: '0 12px 40px rgba(255, 107, 53, 0.2)',
                    },
                  }}
                >
                  <CardContent sx={{ p: 3, textAlign: 'center' }}>
                    <Typography
                      variant="h5"
                      sx={{ mb: 2, fontWeight: 600 }}
                    >
                      {plan.title}
                    </Typography>
                    <Typography
                      variant="h3"
                      sx={{ mb: 2, fontWeight: 700 }}
                    >
                      {plan.price}
                    </Typography>
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
            </Box>
          ))}
        </Box>

        <Box mt={4} display="flex" justifyContent="center">
          <Chip
            icon={<Star />}
            label="Recommended for most users"
            color="primary"
            sx={{ fontWeight: 600 }}
          />
        </Box>
      </Container>
    </Box>
  );
};

export default PricingSection;

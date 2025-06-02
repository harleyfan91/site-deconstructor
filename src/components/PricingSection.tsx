import React from 'react';
import {
  Box,
  Container,
  Typography,
  Grid,
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
  const plans = [
    {
      name: 'Free',
      price: '$0',
      period: 'forever',
      description: 'Perfect for getting started',
      features: [
        '5 website analyses per month',
        'Basic color extraction',
        'Font identification',
        'Image gallery access',
        'Basic tech stack detection',
        'Community support',
      ],
      buttonText: 'Get Started Free',
      buttonVariant: 'outlined' as const,
      popular: false,
    },
    {
      name: 'Pro',
      price: '$29',
      period: 'per month',
      description: 'For professionals and teams',
      features: [
        'Unlimited website analyses',
        'Advanced color palettes',
        'Complete font analysis',
        'High-resolution image downloads',
        'Detailed tech stack reports',
        'Performance metrics',
        'SEO insights',
        'Export to PDF/JSON/CSV',
        'Priority support',
        'API access',
      ],
      buttonText: 'Start Pro Trial',
      buttonVariant: 'contained' as const,
      popular: true,
    },
  ];

  return (
    <Box sx={{ py: { xs: 8, md: 12 } }}>
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
            Simple, Transparent Pricing
          </Typography>
          <Typography
            variant="h6"
            align="center"
            color="text.secondary"
            sx={{ mb: 8, maxWidth: 600, mx: 'auto' }}
          >
            Choose the plan that fits your needs. Upgrade or downgrade at any time.
          </Typography>
        </motion.div>

        <Grid container spacing={4} justifyContent="center">
          {plans.map((plan, index) => (
            <Grid item xs={12} md={6} lg={5} key={index}>
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.2 }}
                viewport={{ once: true }}
                whileHover={{ y: -10 }}
              >
                <Card
                  sx={{
                    height: '100%',
                    position: 'relative',
                    border: plan.popular ? '2px solid' : '1px solid',
                    borderColor: plan.popular ? 'primary.main' : 'rgba(255, 255, 255, 0.1)',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      transform: 'translateY(-8px)',
                      boxShadow: plan.popular 
                        ? '0 20px 60px rgba(255, 107, 53, 0.3)'
                        : '0 20px 60px rgba(0, 0, 0, 0.3)',
                    },
                  }}
                >
                  {plan.popular && (
                    <Chip
                      icon={<Star />}
                      label="Most Popular"
                      color="primary"
                      sx={{
                        position: 'absolute',
                        top: -12,
                        left: '50%',
                        transform: 'translateX(-50%)',
                        fontWeight: 600,
                      }}
                    />
                  )}
                  
                  <CardContent sx={{ p: 4 }}>
                    <Typography
                      variant="h4"
                      sx={{ mb: 1, fontWeight: 600 }}
                    >
                      {plan.name}
                    </Typography>
                    
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{ mb: 3 }}
                    >
                      {plan.description}
                    </Typography>

                    <Box sx={{ mb: 4 }}>
                      <Typography
                        variant="h3"
                        component="span"
                        sx={{ fontWeight: 700 }}
                      >
                        {plan.price}
                      </Typography>
                      <Typography
                        variant="body1"
                        component="span"
                        color="text.secondary"
                        sx={{ ml: 1 }}
                      >
                        {plan.period}
                      </Typography>
                    </Box>

                    <Button
                      variant={plan.buttonVariant}
                      fullWidth
                      size="large"
                      sx={{
                        mb: 3,
                        py: 1.5,
                        ...(plan.popular && {
                          background: 'linear-gradient(45deg, #FF6B35 30%, #FF8A65 90%)',
                          boxShadow: '0 4px 15px rgba(255, 107, 53, 0.3)',
                        }),
                      }}
                    >
                      {plan.buttonText}
                    </Button>

                    <List sx={{ p: 0 }}>
                      {plan.features.map((feature, featureIndex) => (
                        <ListItem key={featureIndex} sx={{ px: 0, py: 0.5 }}>
                          <ListItemIcon sx={{ minWidth: 36 }}>
                            <Check
                              sx={{
                                color: plan.popular ? 'primary.main' : 'success.main',
                                fontSize: '1.25rem',
                              }}
                            />
                          </ListItemIcon>
                          <ListItemText
                            primary={feature}
                            primaryTypographyProps={{
                              variant: 'body2',
                              color: 'text.primary',
                            }}
                          />
                        </ListItem>
                      ))}
                    </List>
                  </CardContent>
                </Card>
              </motion.div>
            </Grid>
          ))}
        </Grid>

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          viewport={{ once: true }}
        >
          <Typography
            variant="body2"
            align="center"
            color="text.secondary"
            sx={{ mt: 6 }}
          >
            All plans include 14-day free trial • No credit card required • Cancel anytime
          </Typography>
        </motion.div>
      </Container>
    </Box>
  );
};

export default PricingSection;

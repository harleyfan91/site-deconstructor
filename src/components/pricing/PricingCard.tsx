
import React from 'react';
import {
  Card,
  CardContent,
  Button,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Chip,
  Typography,
  Box,
} from '@mui/material';
import { Check, StarBorder, Close } from '@mui/icons-material';
import { motion } from 'framer-motion';
import { PricingPlan } from './PricingPlan';

interface PricingCardProps {
  plan: PricingPlan;
  index: number;
}

const PricingCard = ({ plan, index }: PricingCardProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: index * 0.1 }}
      viewport={{ once: true }}
      whileHover={{ y: -10 }}
      style={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
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
          overflow: 'visible',
          flex: 1,
          '&:hover': {
            transform: 'translateY(-8px)',
            boxShadow: '0 12px 40px rgba(255, 107, 53, 0.2)',
          },
        }}
      >
        {plan.recommended && (
          <Chip
            icon={<StarBorder />}
            label="Recommended"
            color="primary"
            sx={{
              position: 'absolute',
              top: -16,
              left: '50%',
              transform: 'translateX(-50%)',
              fontWeight: 600,
              zIndex: 2,
              boxShadow: '0 4px 12px rgba(255, 107, 53, 0.3)',
            }}
          />
        )}
        <CardContent sx={{ p: 3, textAlign: 'center', flex: 1, display: 'flex', flexDirection: 'column' }}>
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
          <List sx={{ flex: 1 }}>
            {plan.features.map((feature, i) => (
              <ListItem key={i} disablePadding>
                <ListItemIcon sx={{ minWidth: '30px' }}>
                  <Check color="primary" />
                </ListItemIcon>
                <ListItemText primary={feature} />
              </ListItem>
            ))}
            {plan.unavailableFeatures?.map((feature, i) => (
              <ListItem key={`unavailable-${i}`} disablePadding>
                <ListItemIcon sx={{ minWidth: '30px' }}>
                  <Close sx={{ color: 'text.disabled' }} />
                </ListItemIcon>
                <ListItemText 
                  primary={feature} 
                  sx={{ 
                    '& .MuiListItemText-primary': { 
                      color: 'text.disabled'
                    } 
                  }} 
                />
              </ListItem>
            ))}
            {plan.additionalFeatures?.map((feature, i) => (
              <ListItem key={`additional-${i}`} disablePadding>
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
  );
};

export default PricingCard;

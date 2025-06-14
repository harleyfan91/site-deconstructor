
import React from 'react';
import { Box, Card, CardContent, Typography } from '@mui/material';
import { motion } from 'framer-motion';

interface FeatureCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  hoverDelay?: number;
}

/**
 * Renders a single feature card; adjusts padding/icon size for mobile readability.
 */
const FeatureCard: React.FC<FeatureCardProps> = ({
  icon,
  title,
  description,
  hoverDelay = 0,
}) => (
  <Box sx={{ zIndex: 2, position: 'relative', height: '100%' }}>
    <motion.div
      // Initial mount animation
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: hoverDelay * 0.1 }}
      viewport={{ once: true }}
      whileHover={{ y: -10 }}
      style={{ height: '100%' }}
    >
      <Card
        sx={{
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'stretch',
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
        <CardContent
          sx={{
            p: { xs: 2, sm: 3 }, // Less padding on xs
            textAlign: 'center',
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'flex-start',
          }}
        >
          <Box
            className="feature-icon"
            sx={{
              color: 'text.secondary',
              mb: 2,
              transition: 'all 0.3s ease',
              '& .MuiSvgIcon-root': {
                fontSize: { xs: '2rem', sm: '3rem' }, // Smaller icon on xs
              },
            }}
          >
            {icon}
          </Box>
          <Typography
            variant="h6"
            sx={{
              mb: 2,
              fontWeight: 600,
              fontSize: { xs: '1rem', sm: '1.125rem' },
              wordBreak: 'break-word',
            }}
          >
            {title}
          </Typography>
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{
              lineHeight: 1.6,
              flexGrow: 1,
              fontSize: { xs: '0.85rem', sm: '1rem' },
            }}
          >
            {description}
          </Typography>
        </CardContent>
      </Card>
    </motion.div>
  </Box>
);

export default FeatureCard;

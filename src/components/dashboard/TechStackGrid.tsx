
import React from 'react';
import { Box, Typography } from '@mui/material';
// Import icon mapping and getIcon from TechTab or re-define here as needed
import { getIcon } from './techUtils';

/**
 * Props for TechStackGrid.
 */
interface TechStackGridProps {
  techStack: { category: string; technology: string }[];
}

/**
 * Render grid of tech stack cards (each with icon, technology, category).
 * UI/logic remain unchanged.
 */
const TechStackGrid: React.FC<TechStackGridProps> = ({ techStack }) => {
  return (
    <Box
      sx={{
        display: 'grid',
        gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(3, 1fr)' },
        gap: 2,
      }}
    >
      {techStack.map((tech, index) => {
        const IconComponent = getIcon(tech.category);
        return (
          <Box
            key={index}
            sx={{
              p: 0,
              border: '1px solid rgba(0,0,0,0.1)',
              borderRadius: 2,
              display: 'flex',
              flexDirection: 'column',
              minHeight: 78,
              height: 102,
              overflow: 'hidden',
              boxShadow: '0 0 0 0 transparent',
              cursor: 'default',
            }}
          >
            {/* Top section: transparent, white tech name */}
            <Box
              sx={{
                flex: 1,
                minHeight: 0,
                px: 2,
                py: 0.85,
                display: 'flex',
                alignItems: 'center',
                backgroundColor: 'transparent',
                borderTopLeftRadius: 14,
                borderTopRightRadius: 14,
              }}
            >
              <Typography
                variant="subtitle1"
                sx={{
                  color: '#FFF',
                  fontWeight: 700,
                  fontSize: '1rem',
                  letterSpacing: 0.1,
                  textAlign: 'left',
                  width: '100%',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  fontFamily: 'inherit',
                }}
              >
                {tech.technology}
              </Typography>
            </Box>
            {/* Bottom/orange section: icon + category */}
            <Box
              className="techstack-bottom"
              sx={{
                flex: 2,
                minHeight: 0,
                px: 2,
                py: 1.1,
                display: 'flex',
                alignItems: 'center',
                backgroundColor: 'rgba(255, 107, 53, 0.05)',
                borderBottomLeftRadius: 14,
                borderBottomRightRadius: 14,
                gap: 1.5,
                borderTopLeftRadius: 14,
                borderTopRightRadius: 14,
              }}
            >
              <IconComponent size={22} color="#FF6B35" style={{ marginRight: 10, flexShrink: 0 }} />
              <Typography
                variant="subtitle2"
                sx={{
                  color: '#FF6B35',
                  fontWeight: 700,
                  fontSize: '1rem',
                  letterSpacing: 0.1,
                  textShadow: 'none',
                  lineHeight: 1.2,
                  userSelect: 'text',
                  pr: 0,
                }}
              >
                {tech.category}
              </Typography>
            </Box>
          </Box>
        );
      })}
    </Box>
  );
};

export default TechStackGrid;

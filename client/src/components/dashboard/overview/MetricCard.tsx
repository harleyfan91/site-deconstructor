
import React from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  IconButton,
  Tooltip,
} from '@mui/material';
import InfoOutlined from '@mui/icons-material/InfoOutlined';
import { LucideIcon } from 'lucide-react';

interface MetricCardProps {
  titleLines: string[];
  value: string;
  icon: LucideIcon;
  color: string;
  description: string;
  info?: string;
  tooltip: string;
  onInfo?: (event: React.MouseEvent<HTMLElement>, info: string) => void;
}

const MetricCard: React.FC<MetricCardProps> = ({
  titleLines,
  value,
  icon: IconComponent,
  color,
  description,
  info,
  tooltip,
  onInfo,
}) => {
  return (
    <Card sx={{ height: '100%', borderRadius: 2 }}>
      <CardContent sx={{ p: 3 }}>
        {/* Card Title FIRST, now forced to 2 rows */}
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            mb: 1,
            minHeight: 52, // Ensure same height for all cards
          }}
        >
          <Typography
            variant="h6"
            sx={{
              fontWeight: 'bold',
              color: '#fff',
              mb: 0,
              lineHeight: 1.15,
              wordBreak: 'break-word',
            }}
            data-testid="card-title"
          >
            {titleLines[0]}
            <span className="hidden sm:inline"> </span>
            <br className="sm:hidden" />
            {titleLines[1]}
          </Typography>
          {/* Always render a placeholder IconButton for alignment (real or invisible) */}
          {info && onInfo ? (
            <IconButton size="small" aria-label="info" onClick={e => onInfo(e, info)}>
              <InfoOutlined fontSize="small" />
            </IconButton>
          ) : (
            // Invisible IconButton to reserve space
            <IconButton size="small" sx={{ visibility: 'hidden' }}>
              <InfoOutlined fontSize="small" />
            </IconButton>
          )}
        </Box>
        {/* Icon and Value */}
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <Box
            sx={{
              p: 1,
              borderRadius: 1,
              backgroundColor: `${color}20`,
              color: color,
              mr: 2,
            }}
          >
            <IconComponent size={24} />
          </Box>
          <Tooltip 
            title={tooltip}
            enterDelay={300}
            enterTouchDelay={300}
          >
            <Typography variant="h6" component="div" sx={{ fontWeight: 'bold', cursor: 'help' }}>
              {value}
            </Typography>
          </Tooltip>
        </Box>
        {/* Description */}
        <Typography variant="body2" color="text.secondary">
          {description}
        </Typography>
      </CardContent>
    </Card>
  );
};

export default MetricCard;

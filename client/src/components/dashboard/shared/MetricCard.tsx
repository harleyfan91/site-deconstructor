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

// Extended interface that supports both PerformanceTab and OverviewTab use cases
export interface MetricCardProps {
  // Core props (used by both)
  icon: LucideIcon;
  value: string;
  color: string;
  description: string;
  
  // PerformanceTab style (simple single title)
  title?: string;
  
  // OverviewTab style (multi-line title support)
  titleLines?: string[];
  
  // OverviewTab specific props
  info?: string;
  tooltip?: string;
  onInfo?: (event: React.MouseEvent<HTMLElement>, info: string) => void;
  
  // Layout variants
  variant?: 'performance' | 'overview';
  
  // Loading state
  loading?: boolean;
}

// Helper to determine score color given a numeric score (for PerformanceTab compatibility)
const getScoreColor = (score: number) => {
  if (score >= 90) return '#4CAF50';
  if (score >= 70) return '#FF9800';
  return '#F44336';
};

// Helper to get score tooltip text (for PerformanceTab compatibility)
const getScoreTooltip = (score: number) => {
  if (score >= 90) return 'Excellent performance (90+)';
  if (score >= 70) return 'Good performance (70-89)';
  return 'Needs improvement (<70)';
};

export const MetricCard: React.FC<MetricCardProps> = ({
  icon: IconComponent,
  title,
  titleLines,
  value,
  color,
  description,
  info,
  tooltip,
  onInfo,
  variant = 'performance', // Default to PerformanceTab style for backward compatibility
  loading = false,
}) => {
  // Determine final title display
  const finalTitleLines = titleLines || (title ? [title] : ['']);
  const isMultiLine = finalTitleLines.length > 1 || (finalTitleLines[0] && finalTitleLines[0].includes(' '));
  
  // Determine tooltip text
  const finalTooltip = tooltip || (
    title === 'Performance Score' ? getScoreTooltip(parseInt(value)) : description
  );

  if (variant === 'overview') {
    // OverviewTab layout style
    return (
      <Card sx={{ height: '100%', borderRadius: 2 }}>
        <CardContent sx={{ p: 3 }}>
          {/* Card Title FIRST, supports multi-line */}
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
              {finalTitleLines[0]}
              {finalTitleLines[1] && (
                <>
                  <span className="hidden sm:inline"> </span>
                  <br className="sm:hidden" />
                  {finalTitleLines[1]}
                </>
              )}
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
              title={finalTooltip}
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
  }

  // PerformanceTab layout style (default)
  return (
    <Card sx={{ height: '100%', borderRadius: 2 }}>
      <CardContent sx={{ p: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <IconComponent size={24} color="#FF6B35" style={{ marginRight: 8 }} />
          <Typography variant="h6" sx={{ fontWeight: 'bold', lineHeight: 1.2 }}>
            {finalTitleLines.join(' ')}
          </Typography>
        </Box>
        <Tooltip
          title={finalTooltip}
          enterDelay={300}
          enterTouchDelay={300}
        >
          <Typography
            variant={title === 'Performance Score' ? 'h2' : 'h3'}
            sx={{ fontWeight: 'bold', color, textAlign: 'center', mb: 1, cursor: 'help' }}
          >
            {value}
          </Typography>
        </Tooltip>
        <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center' }}>
          {description}
        </Typography>
      </CardContent>
    </Card>
  );
};

export default MetricCard;
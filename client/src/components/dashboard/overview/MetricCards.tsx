
import React from 'react';
import { Box } from '@mui/material';
import { MetricCard } from '../shared/MetricCard';
import { MetricDefinition } from './types';

interface MetricCardsProps {
  metrics: MetricDefinition[];
  onInfo: (event: React.MouseEvent<HTMLElement>, info: string) => void;
}

const MetricCards: React.FC<MetricCardsProps> = ({ metrics, onInfo }) => {
  return (
    <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 1, alignItems: 'stretch' }}>
      {metrics.map((metric, index) => (
        <MetricCard
          key={index}
          titleLines={metric.titleLines}
          value={metric.value}
          icon={metric.icon}
          color={metric.color}
          description={metric.description}
          info={metric.info}
          tooltip={metric.tooltip}
          onInfo={onInfo}
          variant="overview"
          loading={metric.loading}
        />
      ))}
    </Box>
  );
};

export default MetricCards;

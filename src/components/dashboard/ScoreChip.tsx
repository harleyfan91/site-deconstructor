import React from 'react';
import { Chip, Tooltip } from '@mui/material';

interface ScoreChipProps {
  label: string;
  score: number | null;
  description: string;
}

// Simple chip that colors based on score (0-1 range)
const getColor = (score: number | null) => {
  if (score === null || score === undefined) return '#9E9E9E';
  const value = score * 100;
  if (value >= 90) return '#4CAF50';
  if (value >= 70) return '#FF9800';
  return '#F44336';
};

const ScoreChip: React.FC<ScoreChipProps> = ({ label, score, description }) => (
  <Tooltip title={description} enterDelay={300} enterTouchDelay={300}>
    <Chip
      label={`${label}: ${score !== null && score !== undefined ? Math.round(score * 100) : 'N/A'}`}
      sx={{ backgroundColor: getColor(score), color: 'white' }}
      size="small"
    />
  </Tooltip>
);

export default ScoreChip;

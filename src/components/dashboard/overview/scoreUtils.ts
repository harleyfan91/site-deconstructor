
import { useTheme } from '@mui/material/styles';

// Helper: Returns descriptive color for a given score using theme palette
export const useScoreColor = (theme: any) => (score: number) => {
  if (score >= 80) return theme.palette.success.main;
  if (score >= 60) return theme.palette.warning.main;
  return theme.palette.error.main;
};

// Helper: Returns performance/SEO descriptions
export const getScoreDescription = (score: number, excellentMsg: string, goodMsg: string, badMsg: string) => {
  if (score >= 80) return excellentMsg;
  if (score >= 60) return goodMsg;
  return badMsg;
};

// Helper: Get score tooltip text
export const getScoreTooltip = (score: number, type: string) => {
  const level = score >= 80 ? 'Excellent' : score >= 60 ? 'Good' : 'Poor';
  const range = score >= 80 ? '(80+)' : score >= 60 ? '(60-79)' : '(<60)';
  return `${level} ${type} ${range}`;
};

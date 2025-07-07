
import { TrendingUp, Users, Clock, Star } from 'lucide-react';
import type { AnalysisResponse } from '@/types/analysis';
import { useScoreColor, getScoreDescription, getScoreTooltip } from './scoreUtils';
import { MetricDefinition } from './types';

// Extract metrics for easier mapping to cards
export const getMetricDefinitions = (overview: AnalysisResponse['data']['overview'], theme: any): MetricDefinition[] => {
  if (!overview) return [];
  
  return [
  {
    titleLines: ['Overall', 'Score'],
    value: `${overview.overallScore ?? "!"}/100`,
    icon: Star,
    color: useScoreColor(theme)(overview.overallScore ?? "!"),
    description: getScoreDescription(
      overview.overallScore ?? "!",
      'Excellent performance overall',
      'Good, could be improved',
      'Needs improvement',
    ),
    info:
      'Overall score weights performance (40%), SEO (40%) and user experience (20%) based on the collected metrics.',
      tooltip: getScoreTooltip(overview.overallScore ?? "!", 'overall performance'),
  },
  {
    titleLines: ['Page Load', 'Time'],
    value: overview.pageLoadTime ? `${overview.pageLoadTime}s` : "!",
    icon: Clock,
    color: theme.palette.warning.main,
    description: 'Page loading performance',
    tooltip: 'Time taken for the page to fully load',
    loading: !overview.pageLoadTime,
  },
  {
    titleLines: ['SEO', 'Score'],
    value: `${overview.seoScore ?? "!"}/100`,
    icon: TrendingUp,
    color: useScoreColor(theme)(overview.seoScore ?? "!"),
    description: (overview.seoScore ?? "!") >= 80 ? 'Excellent SEO optimization' : 'SEO could be improved',
    tooltip: getScoreTooltip(overview.seoScore ?? "!", 'SEO optimization'),
  },
  {
    titleLines: ['User', 'Experience'],
    value: `${overview.userExperienceScore ?? "!"}/100`,
    icon: Users,
    color: (overview.userExperienceScore ?? "!") >= 80 ? theme.palette.success.main : theme.palette.primary.main,
    description: (overview.userExperienceScore ?? "!") >= 80 ? 'Excellent user experience' : 'Good user experience',
    tooltip: getScoreTooltip(overview.userExperienceScore ?? "!", 'user experience'),
  },
];
};

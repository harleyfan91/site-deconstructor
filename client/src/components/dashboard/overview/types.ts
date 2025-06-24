
import { LucideIcon } from 'lucide-react';

export interface MetricDefinition {
  titleLines: string[];
  value: string;
  icon: LucideIcon;
  color: string;
  description: string;
  info?: string;
  tooltip: string;
}

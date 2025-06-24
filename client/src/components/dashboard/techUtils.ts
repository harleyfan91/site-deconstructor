
import React from 'react';
// Lucide icons
import { Shield, Globe, Server, Database, Code, Layers, Zap, Activity, BarChart } from 'lucide-react';

/**
 * Icon mapping by tech stack category.
 */
const iconMap: { [key: string]: React.ElementType } = {
  'Frontend Framework': Code,
  'JavaScript frameworks': Code,
  'Framework': Code,
  'Build Tool': Zap,
  'Styling': Layers,
  'CSS frameworks': Layers,
  'CSS Framework': Layers,
  'Backend': Server,
  'Database': Database,
  'Databases': Database,
  'Hosting': Globe,
  'Library': Code,
  'JavaScript libraries': Code,
  'Markup': Code,
  'Web servers': Server,
  'Analytics': BarChart,
  'Tag managers': Activity,
  'CDN': Globe,
  'Content delivery networks': Globe,
  'Widgets': Code,
  'Unknown': Code,
  'default': Server
};

/**
 * Returns the icon component for a given tech category.
 */
export function getIcon(category: string): React.ElementType {
  return iconMap[category] || iconMap['default'];
}

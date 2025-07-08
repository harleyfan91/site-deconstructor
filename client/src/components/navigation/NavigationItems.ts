
export interface NavigationItem {
  label: string;
  id: string;
  type: 'scroll' | 'link';
}

export const navigationItems: NavigationItem[] = [
  { label: 'Features', id: 'features', type: 'scroll' },
  { label: 'Pricing', id: 'pricing', type: 'scroll' },
  { label: 'Analyze a URL', id: '/analyze', type: 'link' },
  { label: 'Dashboard', id: '/dashboard', type: 'link' },
];

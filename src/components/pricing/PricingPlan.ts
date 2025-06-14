
export interface PricingPlan {
  title: string;
  price: string;
  priceNote?: string;
  description: string;
  features: string[];
  unavailableFeatures?: string[];
  additionalFeatures?: string[];
  cta: string;
  recommended?: boolean;
}

export const pricingPlans: PricingPlan[] = [
  {
    title: 'Basic',
    price: 'Free',
    priceNote: '$0 to start Deconstructing',
    description: 'For individuals and small teams',
    features: [
      'Limited color palette extraction',
      'Basic font analysis',
      'Up to 5 webpage scans per month',
    ],
    unavailableFeatures: [
      'Tech Stack Detection (50+ Technologies)',
      'Security Headers & Privacy Compliance',
      'SEO & Social Media Optimization',
      'Performance Benchmarking (Core Web Vitals)',
      'Visual Asset Classification',
      'Professional Export Reports',
    ],
    cta: 'Get Started',
  },
  {
    title: 'Pro',
    price: '$19.99',
    priceNote: 'One-time payment',
    description: 'Advanced features for power users',
    features: [
      'Advanced Color Harmony Analysis',
      'Complete Font Loading Performance',
      'Unlimited web page analysis',
    ],
    additionalFeatures: [
      'Tech Stack Detection (50+ Technologies)',
      'Security Headers & Privacy Compliance',
      'SEO & Social Media Optimization',
      'Performance Benchmarking (Core Web Vitals)',
      'Visual Asset Classification',
      'Professional Export Reports',
    ],
    cta: 'Become a Pro User',
    recommended: true,
  },
];

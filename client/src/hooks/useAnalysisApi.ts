import { useState } from 'react';
import type { AnalysisResponse } from '@/types/analysis';

// Extended types for the new analysis data
export interface MobileResponsivenessData {
  score: number;
  issues: Array<{
    id: string;
    title: string;
    description: string;
  }>;
}

export interface SecurityScoreData {
  grade: string;
  findings: Array<{
    id: string;
    title: string;
    description: string;
  }>;
}

export interface AccessibilityData {
  violations: any[];
}

export interface HeaderChecksData {
  hsts: string;
  csp: string;
  frameOptions: string;
}

// Legacy extended analysis response type removed

export type { AnalysisResponse } from '@/types/analysis';

export const useAnalysisApi = () => {
  const [loading] = useState(false);
  const [error] = useState<string | null>(null);
  const [data] = useState<AnalysisResponse | null>(null);

  const analyzeWebsite = async (_url: string): Promise<AnalysisResponse | null> => {
    console.warn('analyzeWebsite called but backend is removed');
    return null;
  };

  return { analyzeWebsite, loading, error, data };
};
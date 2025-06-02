
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface AnalysisResponse {
  id: string;
  url: string;
  timestamp: string;
  status: 'complete' | 'error';
  data: {
    overview: {
      overallScore: number;
      pageLoadTime: string;
      seoScore: number;
      userExperienceScore: number;
    };
    ui: {
      colors: Array<{
        name: string;
        hex: string;
        usage: string;
      }>;
      fonts: Array<{
        name: string;
        category: string;
        usage: string;
        weight: string;
      }>;
      images: Array<{
        type: string;
        count: number;
        format: string;
        totalSize: string;
      }>;
    };
    performance: {
      coreWebVitals: Array<{
        name: string;
        value: number;
        benchmark: number;
      }>;
      performanceScore: number;
      recommendations: Array<{
        type: 'error' | 'warning' | 'info';
        title: string;
        description: string;
      }>;
    };
    seo: {
      score: number;
      checks: Array<{
        name: string;
        status: 'good' | 'warning' | 'error';
        description: string;
      }>;
      recommendations: Array<{
        title: string;
        description: string;
        priority: 'high' | 'medium' | 'low';
      }>;
    };
    technical: {
      techStack: Array<{
        category: string;
        technology: string;
      }>;
      healthGrade: string;
      issues: Array<{
        type: string;
        description: string;
        severity: 'high' | 'medium' | 'low';
        status: string;
      }>;
    };
  };
}

export const useAnalysisApi = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<AnalysisResponse | null>(null);

  const analyzeWebsite = async (url: string): Promise<AnalysisResponse | null> => {
    setLoading(true);
    setError(null);
    
    try {
      const { data: result, error: functionError } = await supabase.functions.invoke('analyze', {
        body: {},
        headers: {},
        method: 'GET',
      });

      if (functionError) {
        throw new Error(functionError.message);
      }

      // For now, we'll call the function and get sample data
      // Later this will be replaced with actual analysis results
      const response = await fetch(`https://sxrhpwmdslxgwpqfdmxu.supabase.co/functions/v1/analyze?url=${encodeURIComponent(url)}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InN4cmhwd21kc2x4Z3dwcWZkbXh1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDg4NTIwMDUsImV4cCI6MjA2NDQyODAwNX0.jdjgtwLQ-MGBMoRw2cLA14SzrivonF36POCC6YYUVwk'}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }

      const analysisResult: AnalysisResponse = await response.json();
      setData(analysisResult);
      return analysisResult;
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred';
      setError(errorMessage);
      console.error('Analysis API Error:', err);
      return null;
    } finally {
      setLoading(false);
    }
  };

  return {
    analyzeWebsite,
    loading,
    error,
    data,
  };
};

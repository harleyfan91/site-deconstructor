
import { useState } from 'react';
import type { AnalysisResponse } from '@/types/analysis';

export const useAnalysisApi = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<AnalysisResponse | null>(null);

  const analyzeWebsite = async (url: string): Promise<AnalysisResponse | null> => {
    setLoading(true);
    setError(null);
    
    try {
      console.log('Analyzing URL:', url);
      
      // Call the edge function directly with the URL parameter
      const supabaseAnonKey =
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ??
        import.meta.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ??
        '';

      const response = await fetch(
        `https://sxrhpwmdslxgwpqfdmxu.supabase.co/functions/v1/analyze?url=${encodeURIComponent(url)}`,
        {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${supabaseAnonKey}`,
            'Content-Type': 'application/json',
          },
        },
      );

      console.log('Response status:', response.status);

      if (!response.ok) {
        const errorData = await response.text();
        console.error('API Error Response:', errorData);
        throw new Error(`HTTP error! status: ${response.status}, message: ${errorData}`);
      }

      const analysisResult: AnalysisResponse = await response.json();
      console.log('Analysis result:', analysisResult);
      
      setData(analysisResult);
      return analysisResult;
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred';
      console.error('Analysis API Error:', err);
      setError(errorMessage);
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

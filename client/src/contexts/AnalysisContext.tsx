
import React, { createContext, useContext, ReactNode, useMemo, useState } from 'react';
import type { AnalysisResponse } from '@/types/analysis';
import type { SimpleAnalysisResponse } from '@/lib/simpleAdapter';
import { adaptSimpleResponse } from '@/lib/simpleAdapter';

interface AnalysisContextType {
  data: AnalysisResponse | null;
  /** Stores latest analysis result */
  setAnalysis: (data: AnalysisResponse | null) => void;
  loading: boolean;
  /** Allows components to toggle loading state */
  setLoading: (val: boolean) => void;
  error: string | null;
  /** Allows components to set an error message */
  setError: (err: string | null) => void;
  /** Convenience helper that triggers the simple analysis endpoint */
  analyzeWebsite: (url: string) => Promise<AnalysisResponse | null>;
}

const AnalysisContext = createContext<AnalysisContextType | undefined>(undefined);

interface AnalysisProviderProps {
  children: ReactNode;
}

export const AnalysisProvider: React.FC<AnalysisProviderProps> = ({ children }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<AnalysisResponse | null>(null);

  const setAnalysis = (analysis: AnalysisResponse | null) => setData(analysis);

  const analyzeWebsite = async (url: string): Promise<AnalysisResponse | null> => {
    console.log('🔍 Starting analysis for:', url);
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/overview', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url })
      });

      if (!response.ok) {
        throw new Error(`Analysis failed: ${response.status} ${response.statusText}`);
      }

      const result: SimpleAnalysisResponse = await response.json();
      const adapted = adaptSimpleResponse(result);
      setData(adapted);
      console.log('✅ Analysis completed:', adapted);
      return adapted;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Analysis failed';
      console.error('❌ Analysis error:', errorMessage);
      setError(errorMessage);
      return null;
    } finally {
      setLoading(false);
    }
  };

  // Memoize the context value to prevent unnecessary re-renders
  const contextValue = useMemo(() => ({
    data,
    setAnalysis,
    loading,
    setLoading,
    error,
    setError,
    analyzeWebsite,
  }), [data, loading, error]);

  return (
    <AnalysisContext.Provider value={contextValue}>
      {children}
    </AnalysisContext.Provider>
  );
};

export const useAnalysisContext = () => {
  const context = useContext(AnalysisContext);
  if (context === undefined) {
    throw new Error('useAnalysisContext must be used within an AnalysisProvider');
  }
  return context;
};

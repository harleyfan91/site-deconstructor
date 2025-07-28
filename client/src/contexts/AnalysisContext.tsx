
import React, { createContext, useContext, ReactNode, useMemo, useState } from 'react';
import type { AnalysisResponse } from '@/types/analysis';

interface AnalysisContextType {
  data: AnalysisResponse | null;
  loading: boolean;
  error: string | null;
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

  const analyzeWebsite = async (url: string): Promise<AnalysisResponse | null> => {
    console.log('🔍 Starting analysis for:', url);
    setLoading(true);
    setError(null);

    try {
      // Call the backend API endpoint
      const response = await fetch(`/api/overview?url=${encodeURIComponent(url)}`);
      
      if (!response.ok) {
        throw new Error(`Analysis failed: ${response.status} ${response.statusText}`);
      }

      const result = await response.json();
      setData(result);
      console.log('✅ Analysis completed:', result);
      return result;
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
    loading,
    error,
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

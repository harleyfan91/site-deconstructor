
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
  const [loading] = useState(false);
  const [error] = useState<string | null>(null);
  const [data] = useState<AnalysisResponse | null>(null);

  const analyzeWebsite = async (_url: string): Promise<AnalysisResponse | null> => {
    console.warn('analyzeWebsite called but backend is removed');
    return null;
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

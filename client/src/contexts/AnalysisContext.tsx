
import React, { createContext, useContext, ReactNode, useMemo } from 'react';
import { useAnalysisApi, AnalysisResponse } from '../hooks/useAnalysisApi';

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
  const analysisApi = useAnalysisApi();

  // Memoize the context value to prevent unnecessary re-renders
  const contextValue = useMemo(() => ({
    data: analysisApi.data,
    loading: analysisApi.loading,
    error: analysisApi.error,
    analyzeWebsite: analysisApi.analyzeWebsite,
  }), [analysisApi.data, analysisApi.loading, analysisApi.error, analysisApi.analyzeWebsite]);

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

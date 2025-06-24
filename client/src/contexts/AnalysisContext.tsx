
import React, { createContext, useContext, ReactNode } from 'react';
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

  return (
    <AnalysisContext.Provider value={analysisApi}>
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

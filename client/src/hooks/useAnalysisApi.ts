
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

// Extended analysis response type
export interface ExtendedAnalysisResponse extends AnalysisResponse {
  mobileResponsiveness?: MobileResponsivenessData;
  securityScore?: SecurityScoreData;
  accessibility?: AccessibilityData;
  headerChecks?: HeaderChecksData;
}

export type { AnalysisResponse } from '@/types/analysis';

export const useAnalysisApi = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<ExtendedAnalysisResponse | null>(null);
  
  // Add request deduplication
  const activeRequests = new Map<string, Promise<ExtendedAnalysisResponse | null>>();

  const analyzeWebsite = async (url: string): Promise<ExtendedAnalysisResponse | null> => {
    // Check if we already have a request in progress for this URL
    if (activeRequests.has(url)) {
      return activeRequests.get(url)!;
    }
    
    setLoading(true);
    setError(null);
    
    // Create the request promise
    const requestPromise = (async () => {
      try {
        // Call the server API route
        const response = await fetch(
          `/api/analyze?url=${encodeURIComponent(url)}`,
          {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json'
            },
          }
        );

      if (!response.ok) {
        const errorData = await response.text();
        console.error('API Error Response:', errorData);
        throw new Error(`HTTP error! status: ${response.status}, message: ${errorData}`);
      }

      const analysisResult: ExtendedAnalysisResponse = await response.json();
      
      // Clear any previous errors since we got a successful result
      setError(null);
      setData(analysisResult);
      return analysisResult;
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred';
      console.error('Analysis API Error:', err);
      setError(errorMessage);
      setData(null);
      return null;
      } finally {
        setLoading(false);
        activeRequests.delete(url);
      }
    })();
    
    // Store the request promise
    activeRequests.set(url, requestPromise);
    
    return requestPromise;
  };

  return {
    analyzeWebsite,
    loading,
    error,
    data,
  };
};

import { useState, useRef, useCallback } from 'react';
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

// Request deduplication cache
const requestCache = new Map<string, Promise<ExtendedAnalysisResponse | null>>();

export const useAnalysisApi = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<ExtendedAnalysisResponse | null>(null);
  const currentRequestRef = useRef<string | null>(null);

  const analyzeWebsite = useCallback(async (url: string): Promise<ExtendedAnalysisResponse | null> => {
    // Prevent duplicate requests for the same URL
    if (currentRequestRef.current === url) {
      console.log('Request already in progress for:', url);
      return data;
    }

    // Check if there's already a request for this URL
    if (requestCache.has(url)) {
      console.log('Using cached request for:', url);
      setLoading(true);
      try {
        const result = await requestCache.get(url)!;
        if (result) {
          setData(result);
          setError(null);
        }
        return result;
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred';
        setError(errorMessage);
        return null;
      } finally {
        setLoading(false);
      }
    }

    currentRequestRef.current = url;
    setLoading(true);
    setError(null);

    // Create the request promise and cache it
    const requestPromise = (async (): Promise<ExtendedAnalysisResponse | null> => {
      try {
        console.log('🚀 Starting progressive analysis for:', url);

        // Step 1: Get immediate local analysis data (no PSI)
        console.log('⚡ Fetching immediate local analysis...');
        const immediateResponse = await fetch(`/api/analyze/immediate?url=${encodeURIComponent(url)}`, {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' }
        });

        if (!immediateResponse.ok) {
          throw new Error(`Immediate analysis failed: ${immediateResponse.status}`);
        }

        const immediateResult: ExtendedAnalysisResponse = await immediateResponse.json();
        console.log('✅ Immediate analysis completed - showing Overview');

        // Update UI immediately with local data and clear loading
        setData(immediateResult);
        setLoading(false);

        // Step 2: Get PSI data in background and update
        console.log('🔍 Fetching PSI data in background...');
        fetch(`/api/analyze/psi?url=${encodeURIComponent(url)}`, {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' }
        }).then(async (psiResponse) => {
          if (psiResponse.ok) {
            const psiData = await psiResponse.json();
            console.log('🎯 PSI data received - updating metrics');
            
            // Update only the PSI-dependent fields
            setData(prevData => {
              if (!prevData) return null;
              return {
                ...prevData,
                data: {
                  ...prevData.data,
                  overview: {
                    ...prevData.data.overview,
                    pageLoadTime: psiData.pageLoadTime,
                    coreWebVitals: psiData.coreWebVitals
                  },
                  performance: {
                    ...prevData.data.performance,
                    coreWebVitals: psiData.coreWebVitalsArray
                  }
                }
              };
            });
          } else {
            console.warn('PSI data failed, keeping local analysis');
          }
        }).catch((err) => {
          console.warn('PSI error:', err);
        });

        return immediateResult;

      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred';
        console.error('Analysis API Error:', err);
        throw new Error(errorMessage);
      }
    })();

    // Cache the request
    requestCache.set(url, requestPromise);

    try {
      const result = await requestPromise;
      setLoading(false);  // Analysis complete, stop loading
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred';
      setError(errorMessage);
      setLoading(false);
      return null;
    } finally {
      currentRequestRef.current = null;
      // Clean up cache after 5 minutes to prevent memory leaks
      setTimeout(() => {
        requestCache.delete(url);
      }, 5 * 60 * 1000);
    }
  }, [data]);

  return {
    analyzeWebsite,
    loading,
    error,
    data,
  };
};
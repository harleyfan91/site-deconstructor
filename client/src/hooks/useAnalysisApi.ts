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

        // Step 1: Immediate local analysis for Overview tab
        console.log('⚡ Fetching immediate analysis...');
        const immediateResponse = await fetch(`/api/analyze/immediate?url=${encodeURIComponent(url)}`, {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' }
        });

        if (!immediateResponse.ok) {
          throw new Error(`Immediate analysis failed: ${immediateResponse.status}`);
        }

        const immediateResult: ExtendedAnalysisResponse = await immediateResponse.json();
        console.log('✅ Immediate analysis completed - showing Overview');

        // Update UI immediately with local data and CLEAR LOADING
        setData(immediateResult);
        setLoading(false);  // Clear loading state here to show dashboard immediately

        // Step 2: Complete analysis runs in background without blocking UI
        console.log('🔍 Fetching complete analysis in background...');
        
        // Run complete analysis in background
        fetch(`/api/analyze/full?url=${encodeURIComponent(url)}`, {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' }
        }).then(async (fullResponse) => {
          if (fullResponse.ok) {
            const fullResult: ExtendedAnalysisResponse = await fullResponse.json();
            console.log('🎯 Complete analysis finished - updating data');
            
            // Update data with complete results (includes PSI data)
            setData(fullResult);
            
            if (fullResult.mobileResponsiveness || fullResult.securityScore || 
                fullResult.accessibility || fullResult.headerChecks) {
              console.log('Complete analysis data structure validated');
            }
          } else {
            console.warn('Complete analysis failed, keeping immediate analysis data');
          }
        }).catch((err) => {
          console.warn('Complete analysis error:', err);
          // Keep the immediate analysis data, don't throw error
        });

        // Return immediate result to show dashboard
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
      // Loading is already set to false in the promise after immediate response
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
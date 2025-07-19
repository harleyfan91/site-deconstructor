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

        // Polling logic for fast UX
        console.log('⚡ Starting polling for analysis...');
        let pollAttempts = 0;
        const maxPollAttempts = 30; // 2 minutes max
        
        const pollForResults = async (): Promise<ExtendedAnalysisResponse> => {
          const overviewResponse = await fetch(`/api/overview?url=${encodeURIComponent(url)}`, {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' }
          });

          if (!overviewResponse.ok) {
            throw new Error(`Overview analysis failed: ${overviewResponse.status}`);
          }

          const overviewData = await overviewResponse.json();
          
          // Check if still pending
          if (overviewData.status === 'pending') {
            console.log(`⏳ Analysis pending, poll attempt ${pollAttempts + 1}`);
            
            // Create partial result for immediate display with skeletons
            const partialResult: ExtendedAnalysisResponse = {
              id: Math.random().toString(36).substr(2, 9),
              timestamp: new Date().toISOString(),
              url,
              data: overviewData,
              loadingComplete: false,
              status: 'pending'
            };
            
            // Update UI with pending state immediately on first call
            if (pollAttempts === 0) {
              setData(partialResult);
            }
            
            pollAttempts++;
            if (pollAttempts < maxPollAttempts) {
              // Poll every 4 seconds
              await new Promise(resolve => setTimeout(resolve, 4000));
              return pollForResults();
            } else {
              throw new Error('Analysis timed out after 2 minutes');
            }
          }

          console.log('✅ Overview analysis completed');
          
          // Complete result
          const result: ExtendedAnalysisResponse = {
            id: Math.random().toString(36).substr(2, 9),
            timestamp: new Date().toISOString(),
            url,
            data: overviewData,
            loadingComplete: true,
            status: 'complete'
          };

          setData(result);
          setLoading(false);
          return result;
        };

        return await pollForResults();

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
      setLoading(false);
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
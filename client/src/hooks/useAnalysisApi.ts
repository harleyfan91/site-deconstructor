import React, { useState, useRef, useCallback } from 'react';
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
  const currentRequestRef = useRef<string | null>(null);
  const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Optimized polling for overview data
  const startPolling = useCallback((url: string) => {
    console.log('⚡ Starting polling for analysis...');
    let pollCount = 0;
    
    const poll = async () => {
      try {
        pollCount++;
        const response = await fetch(`/api/overview?url=${encodeURIComponent(url)}`);
        const result = await response.json();
        
        if (result.status === 'complete') {
          console.log('✅ Overview analysis completed');
          setData(result);
          setLoading(false);
          if (pollingIntervalRef.current) {
            clearInterval(pollingIntervalRef.current);
            pollingIntervalRef.current = null;
          }
        } else {
          console.log(`⏳ Analysis pending, poll attempt ${pollCount}`);
          setData(result); // Show partial data if available
        }
      } catch (error) {
        console.error('Polling error:', error);
        setError('Failed to fetch analysis data');
        setLoading(false);
        if (pollingIntervalRef.current) {
          clearInterval(pollingIntervalRef.current);
          pollingIntervalRef.current = null;
        }
      }
    };

    // Start polling immediately, then every 4 seconds
    poll();
    pollingIntervalRef.current = setInterval(poll, 4000);
  }, []);

  const analyzeWebsite = useCallback(async (url: string): Promise<ExtendedAnalysisResponse | null> => {
    console.log('🚀 Starting progressive analysis for:', url);
    
    // Reset state
    setLoading(true);
    setError(null);
    setData(null);
    currentRequestRef.current = url;

    // Fire-and-forget scan trigger (as per execution gate)
    try {
      await fetch('/api/scan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url })
      });
    } catch (error) {
      console.warn('Scan trigger failed (non-blocking):', error);
    }

    // Start optimized polling
    startPolling(url);
    
    return data; // Will be updated via polling
  }, [startPolling]);

  // Cleanup polling on unmount
  React.useEffect(() => {
    return () => {
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
        pollingIntervalRef.current = null;
      }
    };
  }, []);

  return { analyzeWebsite, loading, error, data };
};
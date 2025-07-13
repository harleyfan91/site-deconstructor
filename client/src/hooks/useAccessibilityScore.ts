import { useState, useEffect } from 'react';

// Simple fetcher function for API calls
const fetcher = async (url: string, options?: RequestInit) => {
  const response = await fetch(url, options);
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  return response.json();
};

export function useAccessibilityScore(url: string) {
  const [data, setData] = useState<any>(null);
  const [error, setError] = useState<Error | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!url) {
      setData(null);
      setError(null);
      setIsLoading(false);
      return;
    }

    let isCancelled = false;
    setIsLoading(true);
    setError(null);

    const fetchData = async () => {
      try {
        // Try to get accessibility score from colors endpoint which includes axe-core analysis
        const result = await fetcher(`/api/colors`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ url })
        });
        if (!isCancelled) {
          setData(result);
          setError(null);
        }
      } catch (err) {
        if (!isCancelled) {
          setError(err instanceof Error ? err : new Error('Unknown error'));
          setData(null);
        }
      } finally {
        if (!isCancelled) {
          setIsLoading(false);
        }
      }
    };

    // Add a small delay to prevent excessive API calls
    const timeoutId = setTimeout(fetchData, 100);

    return () => {
      isCancelled = true;
      clearTimeout(timeoutId);
    };
  }, [url]);

  return {
    score: data?.accessibilityScore ? Math.round(data.accessibilityScore) : undefined,
    contrastIssues: data?.contrastIssues || [],
    violations: data?.violations || [],
    isLoading,
    isError: error,
    rawData: data,
  };
}
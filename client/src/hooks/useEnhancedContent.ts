import { useState, useEffect } from 'react';

interface EnhancedContentData {
  ui: {
    imageAnalysis: {
      photoUrls: string[];
      iconUrls: string[];
    };
  };
  content: {
    wordCount: number;
    readabilityScore: number;
  };
}

export const useEnhancedContent = (url: string | null) => {
  const [data, setData] = useState<EnhancedContentData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!url) return;

    const fetchEnhancedContent = async () => {
      setLoading(true);
      setError(null);
      
      try {
        const response = await fetch('/api/analyze/content', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ url }),
        });

        if (!response.ok) {
          throw new Error(`Failed to fetch enhanced content: ${response.status}`);
        }

        const enhancedData = await response.json();
        setData(enhancedData);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
        console.error('Enhanced content analysis failed:', err);
      } finally {
        setLoading(false);
      }
    };

    // Delay the enhanced analysis to allow quick analysis to complete first
    const timeoutId = setTimeout(fetchEnhancedContent, 2000);
    
    return () => clearTimeout(timeoutId);
  }, [url]);

  return { data, loading, error };
};
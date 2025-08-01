import { supabase } from './supabaseClient';

export async function apiFetch(path: string, options: RequestInit = {}) {
  try {
    const { data: { session } } = await supabase.auth.getSession();

    const headers = {
      'Content-Type': 'application/json',
      ...(options.headers || {}),
      ...(session?.access_token && {
        Authorization: `Bearer ${session.access_token}`,
      }),
    };

    const response = await fetch(path, { 
      ...options, 
      headers 
    });

    // Handle auth errors
    if (response.status === 401) {
      console.warn('Authentication failed, redirecting to login');
      // Could trigger auth state reset here if needed
    }

    return response;
  } catch (error) {
    console.error('API fetch error:', error);
    throw error;
  }
}

// Helper for JSON responses
export async function apiRequest<T = any>(path: string, options: RequestInit = {}): Promise<T> {
  const response = await apiFetch(path, options);

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`API Error ${response.status}: ${errorText}`);
  }

  return response.json();
}

// UI Analysis interface
interface UIAnalysis {
  colors: any[];
  fonts: any[];
  images: any[];
  imageAnalysis: any;
  contrastIssues: any[];
  violations: any[];
  accessibilityScore: number;
  status?: string;
}

// UI Analysis
export async function ui(url: string): Promise<UIAnalysis> {
  const response = await apiFetch(`/api/ui/scan?url=${encodeURIComponent(url)}`);
  if (!response.ok) throw new Error('Failed to fetch UI analysis');
  const data = await response.json();
  return data.data || {
    colors: [],
    fonts: [],
    images: [],
    imageAnalysis: {
      totalImages: 0,
      estimatedPhotos: 0,
      estimatedIcons: 0,
      imageUrls: [],
      photoUrls: [],
      iconUrls: [],
      altStats: { withAlt: 0, withoutAlt: 0, emptyAlt: 0, totalImages: 0 }
    },
    contrastIssues: [],
    violations: [],
    accessibilityScore: 0
  };
}
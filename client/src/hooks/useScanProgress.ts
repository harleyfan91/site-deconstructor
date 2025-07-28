import { useEffect, useState } from "react";
import { useScanStatus } from "./useScanStatus";
import { supabase } from "../lib/supabaseClient";

type ProgressData = { 
  progress: number; 
  status: string;
  lastUpdated?: string;
};

export function useScanProgress(scanId: string): ProgressData {
  const { data: initial, isLoading } = useScanStatus(scanId); // polling fallback
  const [realtimeData, setRealtimeData] = useState<ProgressData | null>(null);
  const [isRealtimeConnected, setIsRealtimeConnected] = useState(false);

  useEffect(() => {
    // Skip if no scanId provided
    if (!scanId) return;

    // Check if Supabase is properly configured  
    const hasSupabaseConfig = import.meta.env.VITE_SUPABASE_ANON_KEY &&
                             import.meta.env.VITE_SUPABASE_ANON_KEY !== 'placeholder-key';

    if (!hasSupabaseConfig) {
      console.warn('Supabase not configured for realtime, using polling fallback');
      return;
    }

    const channel = supabase
      .channel(`scan_status_${scanId}`)
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "scan_status",
          filter: `scan_id=eq.${scanId}`,
        },
        (payload) => {
          const row = payload.new as { progress: number; status: string; finishedAt?: string };
          setRealtimeData({
            progress: row.progress || 0,
            status: row.status || 'queued',
            lastUpdated: row.finishedAt || new Date().toISOString()
          });
          setIsRealtimeConnected(true);
        }
      )
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          setIsRealtimeConnected(true);
        } else if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT') {
          setIsRealtimeConnected(false);
          console.warn(`Supabase realtime ${status}, falling back to polling`);
        }
      });

    return () => {
      supabase.removeChannel(channel);
      setIsRealtimeConnected(false);
      setRealtimeData(null);
    };
  }, [scanId]);

  // Use realtime data if available and connected, otherwise fall back to polling
  if (realtimeData && isRealtimeConnected) {
    return realtimeData;
  }

  // Fallback to polling data
  return {
    progress: initial?.progress ?? 0,
    status: initial?.status ?? (isLoading ? 'loading' : 'queued'),
    lastUpdated: initial?.finishedAt
  };
}
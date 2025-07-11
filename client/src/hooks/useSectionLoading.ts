import { useState, useEffect } from 'react';
import type { AnalysisResponse } from '@/types/analysis';

export interface SectionLoadingState {
  performance: boolean;
  seo: boolean;
  technical: boolean;
  ui: boolean;
  content: boolean;
  compliance: boolean;
}

export const useSectionLoading = (data: AnalysisResponse | null, globalLoading: boolean) => {
  const [sectionLoading, setSectionLoading] = useState<SectionLoadingState>({
    performance: true,
    seo: true,
    technical: true,
    ui: true,
    content: true,
    compliance: true,
  });

  useEffect(() => {
    if (!data || globalLoading) {
      // If no data or global loading, all sections are loading
      setSectionLoading({
        performance: true,
        seo: true,
        technical: true,
        ui: true,
        content: true,
        compliance: true,
      });
      return;
    }

    // Check which sections have loaded based on data availability
    setSectionLoading({
      performance: !data.data?.performance?.coreWebVitals || data.data.performance.coreWebVitals.length === 0,
      seo: !data.data?.seo?.score && data.data?.seo?.score !== 0,
      technical: !data.data?.technical?.accessibility,
      ui: !data.data?.ui, // UI tab loads when ui section exists, regardless of colors
      content: !data.data?.overview,
      compliance: !data.data?.technical?.accessibility, // Use accessibility data for compliance until PSI loads
    });
  }, [data, globalLoading]);

  return sectionLoading;
};
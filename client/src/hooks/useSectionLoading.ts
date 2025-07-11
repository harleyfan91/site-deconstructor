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

    // Check which sections have loaded based on data availability (fixed data structure)
    setSectionLoading({
      performance: !data.data?.performance,
      seo: !data.data?.seo,
      technical: !data.data?.tech && !data.data?.technical, // Check both possible locations
      ui: !data.data?.ui,
      content: !data.data?.content && !data.data?.overview,
      compliance: !data.data?.tech && !data.data?.technical, // Compliance uses tech data
    });
  }, [data, globalLoading]);

  return sectionLoading;
};
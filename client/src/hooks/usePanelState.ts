import { useState } from 'react';

export function usePanelState(scanId: string) {
  const [state, setState] = useState<Record<string, boolean>>({});

  const toggle = (sectionId: string) => {
    setState(prev => ({
      ...prev,
      [sectionId]: !prev[sectionId]
    }));
  };

  return { state, toggle };
}
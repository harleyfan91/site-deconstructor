import { useEffect, useState, useCallback } from "react";

type PanelMap = Record<string, boolean>;

export function usePanelState(scanId: string) {
  const key = `panelState:${scanId}`;

  const [state, setState] = useState<PanelMap>(() => {
    try {
      const raw = localStorage.getItem(key);
      return raw ? (JSON.parse(raw) as PanelMap) : {};
    } catch {
      return {};
    }
  });

  // persist on change
  useEffect(() => {
    try {
      localStorage.setItem(key, JSON.stringify(state));
    } catch {
      /* ignore quota errors */
    }
  }, [key, state]);

  // helper toggle
  const toggle = useCallback(
    (sectionId: string) =>
      setState((prev) => ({ ...prev, [sectionId]: !prev[sectionId] })),
    []
  );

  return { state, toggle } as const;
}
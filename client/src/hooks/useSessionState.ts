import { useState, useEffect } from 'react';

/**
 * Persist state to sessionStorage so it survives component unmounts within the same tab session.
 * @param key Unique storage key
 * @param defaultValue Default value when nothing is stored
 */
export function useSessionState<T>(key: string, defaultValue: T) {
  const [value, setValue] = useState<T>(() => {
    if (typeof window === 'undefined') return defaultValue;
    try {
      const stored = window.sessionStorage.getItem(key);
      return stored ? (JSON.parse(stored) as T) : defaultValue;
    } catch (err) {
      console.error('Failed to load session state', err);
      return defaultValue;
    }
  });

  useEffect(() => {
    try {
      window.sessionStorage.setItem(key, JSON.stringify(value));
    } catch (err) {
      console.error('Failed to save session state', err);
    }
  }, [key, value]);

  return [value, setValue] as const;
}

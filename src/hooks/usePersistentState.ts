import { useState, useEffect } from 'react';

/**
 * Persist state to localStorage so it survives component unmounts.
 * @param key Unique storage key
 * @param defaultValue Default value when nothing is stored
 */
export function usePersistentState<T>(key: string, defaultValue: T) {
  const [value, setValue] = useState<T>(() => {
    if (typeof window === 'undefined') return defaultValue;
    try {
      const stored = window.localStorage.getItem(key);
      return stored ? (JSON.parse(stored) as T) : defaultValue;
    } catch (err) {
      console.error('Failed to load persistent state', err);
      return defaultValue;
    }
  });

  useEffect(() => {
    try {
      window.localStorage.setItem(key, JSON.stringify(value));
    } catch (err) {
      console.error('Failed to save persistent state', err);
    }
  }, [key, value]);

  return [value, setValue] as const;
}

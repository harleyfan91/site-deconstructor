import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { usePanelState } from '../../client/src/hooks/usePanelState';

describe('usePanelState', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  it('should initialize with default state', () => {
    const { result } = renderHook(() => usePanelState('test-scan'));
    
    expect(result.current.state).toEqual({});
    expect(typeof result.current.toggle).toBe('function');
  });

  it('should toggle panel state and persist to localStorage', () => {
    const { result } = renderHook(() => usePanelState('test-scan'));
    
    act(() => {
      result.current.toggle('colors');
    });
    
    expect(result.current.state.colors).toBe(true);
    expect(localStorage.setItem).toHaveBeenCalledWith(
      'panelState:test-scan',
      JSON.stringify({ colors: true })
    );
  });

  it('should toggle panel state off when called twice', () => {
    const { result } = renderHook(() => usePanelState('test-scan'));
    
    act(() => {
      result.current.toggle('colors');
    });
    
    act(() => {
      result.current.toggle('colors');
    });
    
    expect(result.current.state.colors).toBe(false);
  });

  it('should load initial state from localStorage', () => {
    const existingState = { fonts: true, accessibility: false };
    localStorage.setItem('panelState:test-scan', JSON.stringify(existingState));
    
    const { result } = renderHook(() => usePanelState('test-scan'));
    
    expect(result.current.state).toEqual(existingState);
  });

  it('should handle different scan IDs independently', () => {
    const { result: result1 } = renderHook(() => usePanelState('scan-1'));
    const { result: result2 } = renderHook(() => usePanelState('scan-2'));
    
    act(() => {
      result1.current.toggle('colors');
    });
    
    expect(result1.current.state.colors).toBe(true);
    expect(result2.current.state.colors).toBeUndefined();
  });

  it('should handle localStorage errors gracefully', () => {
    localStorage.setItem = vi.fn(() => {
      throw new Error('Storage quota exceeded');
    });
    
    const { result } = renderHook(() => usePanelState('test-scan'));
    
    // Should not throw error
    expect(() => {
      act(() => {
        result.current.toggle('colors');
      });
    }).not.toThrow();
  });
});
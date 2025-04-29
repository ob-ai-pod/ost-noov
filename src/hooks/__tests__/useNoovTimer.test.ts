import { renderHook, act } from '@testing-library/react';
import { useNoovTimer } from '../useNoovTimer';

// Mock localStorage
const localStorageMock = (() => {
  let store: { [key: string]: string } = {};
  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value.toString();
    },
    clear: () => {
      store = {};
    }
  };
})();

Object.defineProperty(window, 'localStorage', { value: localStorageMock });

describe('useNoovTimer', () => {
  beforeEach(() => {
    localStorage.clear();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('should initialize with default duration', () => {
    const { result } = renderHook(() => useNoovTimer());
    
    expect(result.current.minutes).toBe(25);
    expect(result.current.seconds).toBe(0);
    expect(result.current.isRunning).toBe(false);
  });

  it('should initialize with custom duration', () => {
    const { result } = renderHook(() => useNoovTimer(10));
    
    expect(result.current.minutes).toBe(10);
    expect(result.current.seconds).toBe(0);
  });

  it('should use stored duration from localStorage', () => {
    localStorage.setItem('noov_last_timer_duration', '15');
    const { result } = renderHook(() => useNoovTimer());
    
    expect(result.current.minutes).toBe(15);
  });

  it('should start and pause timer', () => {
    const { result } = renderHook(() => useNoovTimer(1));

    act(() => {
      result.current.start();
    });
    expect(result.current.isRunning).toBe(true);

    act(() => {
      result.current.pause();
    });
    expect(result.current.isRunning).toBe(false);
  });

  it('should set new duration', () => {
    const { result } = renderHook(() => useNoovTimer());

    act(() => {
      result.current.setDuration(5);
    });

    expect(result.current.minutes).toBe(5);
    expect(localStorage.getItem('noov_last_timer_duration')).toBe('5');
  });

  it('should restart timer', () => {
    const { result } = renderHook(() => useNoovTimer(5));

    // Start and let some time pass
    act(() => {
      result.current.start();
      jest.advanceTimersByTime(60000); // Advance 1 minute
    });

    // Restart
    act(() => {
      result.current.restart();
    });

    expect(result.current.minutes).toBe(5);
    expect(result.current.seconds).toBe(0);
  });

  it('should restart with new duration', () => {
    const { result } = renderHook(() => useNoovTimer(5));

    act(() => {
      result.current.restart(3);
    });

    expect(result.current.minutes).toBe(3);
    expect(result.current.seconds).toBe(0);
  });
});

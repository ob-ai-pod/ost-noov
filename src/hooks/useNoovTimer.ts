import { useTimer } from 'react-timer-hook';
import { useState, useCallback } from 'react';

const STORAGE_KEY = 'noov_last_timer_duration';

export interface NoovTimer {
  minutes: number;
  seconds: number;
  isRunning: boolean;
  start: () => void;
  pause: () => void;
  resume: () => void;
  restart: (durationMinutes?: number) => void;
  setDuration: (minutes: number) => void;
}

export const useNoovTimer = (initialDurationMinutes: number = 25): NoovTimer => {
  // Get last used duration from storage or use initial
  const [durationMinutes, setDurationMinutes] = useState(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? parseInt(stored, 10) : initialDurationMinutes;
  });

  // Create expiry time (current time + duration)
  const getExpiryTimestamp = (minutes: number) => {
    const time = new Date();
    time.setMinutes(time.getMinutes() + minutes);
    return time;
  };

  const {
    minutes,
    seconds,
    isRunning,
    start,
    pause,
    resume,
    restart: timerRestart
  } = useTimer({
    expiryTimestamp: getExpiryTimestamp(durationMinutes),
    autoStart: false
  });

  // Save duration to storage and restart timer
  const setDuration = useCallback((minutes: number) => {
    localStorage.setItem(STORAGE_KEY, minutes.toString());
    setDurationMinutes(minutes);
    timerRestart(getExpiryTimestamp(minutes));
  }, [timerRestart]);

  // Wrapper for restart with duration
  const restart = useCallback((minutes?: number) => {
    const duration = minutes || durationMinutes;
    timerRestart(getExpiryTimestamp(duration));
  }, [durationMinutes, timerRestart]);

  return {
    minutes,
    seconds,
    isRunning,
    start,
    pause,
    resume,
    restart,
    setDuration
  };
};

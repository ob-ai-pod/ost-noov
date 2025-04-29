import React, { useState } from 'react';
import { useNoovTimer } from '../../hooks/useNoovTimer';

export const Timer: React.FC = () => {
  const [inputMinutes, setInputMinutes] = useState('25');
  const {
    minutes,
    seconds,
    isRunning,
    start,
    pause,
    resume,
    restart,
    setDuration
  } = useNoovTimer();

  const handleDurationChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setInputMinutes(value);
  };

  const handleSetDuration = () => {
    const duration = parseInt(inputMinutes, 10);
    if (!isNaN(duration) && duration > 0) {
      setDuration(duration);
    }
  };

  const formatTime = (value: number): string => {
    return value.toString().padStart(2, '0');
  };

  return (
    <div className="timer">
      <div className="timer-display">
        <span className="time">{formatTime(minutes)}:{formatTime(seconds)}</span>
      </div>
      
      <div className="timer-controls">
        {!isRunning && minutes === 0 && seconds === 0 ? (
          <button onClick={() => restart()}>Reset</button>
        ) : isRunning ? (
          <button onClick={pause}>Pause</button>
        ) : (
          <button onClick={resume}>Resume</button>
        )}
        
        {!isRunning && (minutes > 0 || seconds > 0) && (
          <button onClick={start}>Start</button>
        )}
      </div>

      <div className="timer-settings">
        <input
          type="number"
          min="1"
          value={inputMinutes}
          onChange={handleDurationChange}
          placeholder="Minutes"
        />
        <button onClick={handleSetDuration}>Set Duration</button>
      </div>
    </div>
  );
};

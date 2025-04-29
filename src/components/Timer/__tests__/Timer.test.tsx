import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { Timer } from '../Timer';

// Mock the custom hook
jest.mock('../../../hooks/useNoovTimer', () => ({
  useNoovTimer: () => ({
    minutes: 25,
    seconds: 0,
    isRunning: false,
    start: jest.fn(),
    pause: jest.fn(),
    resume: jest.fn(),
    restart: jest.fn(),
    setDuration: jest.fn(),
  }),
}));

describe('Timer', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders timer display', () => {
    render(<Timer />);
    
    const display = screen.getByText('25:00');
    expect(display).toBeInTheDocument();
  });

  it('renders duration input', () => {
    render(<Timer />);
    
    const input = screen.getByPlaceholderText('Minutes');
    expect(input).toBeInTheDocument();
    expect(input).toHaveValue(25);
  });

  it('renders start button when timer is not running', () => {
    render(<Timer />);
    
    const startButton = screen.getByText('Start');
    expect(startButton).toBeInTheDocument();
  });

  it('handles duration input change', () => {
    render(<Timer />);
    
    const input = screen.getByPlaceholderText('Minutes');
    fireEvent.change(input, { target: { value: '10' } });
    
    expect(input).toHaveValue(10);
  });

  it('handles set duration button click', () => {
    const { useNoovTimer } = require('../../../hooks/useNoovTimer');
    const mockSetDuration = jest.fn();
    useNoovTimer.mockImplementation(() => ({
      minutes: 25,
      seconds: 0,
      isRunning: false,
      start: jest.fn(),
      pause: jest.fn(),
      resume: jest.fn(),
      restart: jest.fn(),
      setDuration: mockSetDuration,
    }));

    render(<Timer />);
    
    const input = screen.getByPlaceholderText('Minutes');
    const setButton = screen.getByText('Set Duration');
    
    fireEvent.change(input, { target: { value: '10' } });
    fireEvent.click(setButton);
    
    expect(mockSetDuration).toHaveBeenCalledWith(10);
  });

  it('ignores invalid duration inputs', () => {
    const { useNoovTimer } = require('../../../hooks/useNoovTimer');
    const mockSetDuration = jest.fn();
    useNoovTimer.mockImplementation(() => ({
      minutes: 25,
      seconds: 0,
      isRunning: false,
      start: jest.fn(),
      pause: jest.fn(),
      resume: jest.fn(),
      restart: jest.fn(),
      setDuration: mockSetDuration,
    }));

    render(<Timer />);
    
    const input = screen.getByPlaceholderText('Minutes');
    const setButton = screen.getByText('Set Duration');
    
    fireEvent.change(input, { target: { value: '-5' } });
    fireEvent.click(setButton);
    
    expect(mockSetDuration).not.toHaveBeenCalled();
  });

  it('shows reset button when timer completes', () => {
    const { useNoovTimer } = require('../../../hooks/useNoovTimer');
    useNoovTimer.mockImplementation(() => ({
      minutes: 0,
      seconds: 0,
      isRunning: false,
      start: jest.fn(),
      pause: jest.fn(),
      resume: jest.fn(),
      restart: jest.fn(),
      setDuration: jest.fn(),
    }));

    render(<Timer />);
    
    const resetButton = screen.getByText('Reset');
    expect(resetButton).toBeInTheDocument();
  });
});

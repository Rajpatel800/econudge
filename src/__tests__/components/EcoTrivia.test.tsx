import React from 'react';
import { render, screen, act } from '@testing-library/react';
import EcoTrivia from '@/components/gamification/EcoTrivia';

// Mock fetch
global.fetch = jest.fn() as jest.Mock;

describe('EcoTrivia', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('renders loading skeleton initially', () => {
    (global.fetch as jest.Mock).mockImplementationOnce(() => new Promise(() => {})); // Hang forever
    
    render(<EcoTrivia />);
    act(() => {
      jest.runAllTimers();
    });
    
    // Look for the loading shimmer classes or skeleton indicators
    expect(screen.getByTestId('trivia-skeleton')).toBeInTheDocument();
  });
});

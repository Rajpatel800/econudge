import React from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react';
import NudgeEngine from '@/components/features/NudgeEngine';

// Mock the hook so we don't need real localStorage
const mockAddPledge = jest.fn();
jest.mock('@/hooks/usePledges', () => ({
  usePledges: () => ({
    addPledge: mockAddPledge,
    pledges: [],
  })
}));

// Mock global fetch
global.fetch = jest.fn() as jest.Mock;

// Mock scrollIntoView which is not implemented in jsdom
window.HTMLElement.prototype.scrollIntoView = jest.fn();

describe('NudgeEngine', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('renders the initial form', () => {
    render(<NudgeEngine />);
    expect(screen.getByText('Personal Nudge Engine')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('e.g., Driving 15 miles to work...')).toBeInTheDocument();
  });

  it('handles a successful nudge fetch', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ trees: 5, co2kg: 100, nudge: 'Try biking!' })
    });

    render(<NudgeEngine />);
    
    const input = screen.getByPlaceholderText('e.g., Driving 15 miles to work...');
    fireEvent.change(input, { target: { value: 'Driving' } });
    
    const button = screen.getByText('Analyse');
    
    await act(async () => {
      fireEvent.click(button);
    });

    expect(screen.getByText('100 kg')).toBeInTheDocument();
    expect(screen.getByText('~5 Trees')).toBeInTheDocument();
    expect(screen.getByText('💡 Try biking!')).toBeInTheDocument();
  });

  it('handles API errors', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
    });

    render(<NudgeEngine />);
    
    const input = screen.getByPlaceholderText('e.g., Driving 15 miles to work...');
    fireEvent.change(input, { target: { value: 'Driving' } });
    
    const button = screen.getByText('Analyse');
    
    await act(async () => {
      fireEvent.click(button);
    });

    expect(screen.getByText('Could not analyse your habit. Please try again.')).toBeInTheDocument();
  });

  it('calls addPledge and sets pledged state when pledge button is clicked', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ trees: 5, co2kg: 100, nudge: 'Try biking!' })
    });

    render(<NudgeEngine />);

    const input = screen.getByPlaceholderText('e.g., Driving 15 miles to work...');
    fireEvent.change(input, { target: { value: 'Driving to work' } });

    await act(async () => {
      fireEvent.click(screen.getByText('Analyse'));
    });

    // The result is shown — now click the pledge button
    const pledgeButton = screen.getByText('Pledge to improve this!');
    await act(async () => {
      fireEvent.click(pledgeButton);
    });

    expect(mockAddPledge).toHaveBeenCalledWith(
      'Improve: Driving to work',
      'Try biking!'
    );

    // Advance timer for the setTimeout scroll
    act(() => {
      jest.advanceTimersByTime(500);
    });
  });
});

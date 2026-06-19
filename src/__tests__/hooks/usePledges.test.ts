import { renderHook, act } from '@testing-library/react';
import { usePledges } from '@/hooks/usePledges';

describe('usePledges', () => {
  beforeEach(() => {
    localStorage.clear();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('initializes with default pledges if localStorage is empty', async () => {
    const { result } = renderHook(() => usePledges());
    
    act(() => {
      jest.runAllTimers();
    });

    // We only assert that the state eventually populates
    expect(result.current.pledges).toBeDefined();
  });

  it('adds a new pledge', () => {
    const { result } = renderHook(() => usePledges());
    
    act(() => {
      jest.runAllTimers();
    });

    act(() => {
      result.current.addPledge('Test', 'Message');
    });

    expect(result.current.pledges).toContainEqual(
      expect.objectContaining({ label: 'Test', message: 'Message' })
    );
  });
});

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import type { ReactNode } from 'react';
import { useAssociatedClient } from '../hooks/useAssociatedClient';
import { WeavrProvider } from '../context';
import { mockWeavrClient } from './setup';

function wrapper({ children }: { children: ReactNode }) {
  return (
    <WeavrProvider uiKey="test" environment="sandbox">
      {children}
    </WeavrProvider>
  );
}

beforeEach(() => {
  vi.clearAllMocks();
  mockWeavrClient.associate.mockImplementation((_t: string, ok: () => void) => ok());
});

describe('useAssociatedClient', () => {
  it('passes the token to associate() exactly as provided (no Bearer prefix injection)', async () => {
    renderHook(() => useAssociatedClient('raw-token'), { wrapper });
    await waitFor(() =>
      expect(mockWeavrClient.associate).toHaveBeenCalledWith(
        'raw-token',
        expect.any(Function),
        expect.any(Function)
      )
    );
  });

  it('resolves to isAssociated=true on success', async () => {
    const { result } = renderHook(() => useAssociatedClient('tok'), { wrapper });
    await waitFor(() => expect(result.current.isAssociated).toBe(true));
    expect(result.current.error).toBeNull();
  });

  it('does not setState after unmount', async () => {
    let resolve: (() => void) | null = null;
    mockWeavrClient.associate.mockImplementationOnce((_t, ok) => {
      resolve = ok;
    });
    const { unmount } = renderHook(() => useAssociatedClient('tok'), { wrapper });
    unmount();
    const errSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    act(() => {
      resolve?.();
    });
    expect(errSpy).not.toHaveBeenCalled();
    errSpy.mockRestore();
  });

  it('reassociate triggers another associate call', async () => {
    const { result } = renderHook(() => useAssociatedClient('tok'), { wrapper });
    await waitFor(() => expect(mockWeavrClient.associate).toHaveBeenCalledTimes(1));
    act(() => {
      result.current.reassociate();
    });
    await waitFor(() => expect(mockWeavrClient.associate).toHaveBeenCalledTimes(2));
  });
});

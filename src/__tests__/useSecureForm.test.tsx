import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import type { ReactNode } from 'react';
import { useSecureForm } from '../hooks/useSecureForm';
import { WeavrProvider } from '../context';
import { mockWeavrClient, mockForm } from './setup';

function wrapper({ children }: { children: ReactNode }) {
  return (
    <WeavrProvider uiKey="test" environment="sandbox">
      {children}
    </WeavrProvider>
  );
}

beforeEach(() => {
  vi.clearAllMocks();
});

describe('useSecureForm', () => {
  it('createInput passes three positional args', async () => {
    const { result } = renderHook(() => useSecureForm(), { wrapper });
    await waitFor(() => expect(result.current.isReady).toBe(true));
    act(() => {
      result.current.createInput('pwd', 'password', { placeholder: 'p' });
    });
    expect(mockWeavrClient.form).toHaveBeenCalled();
    expect(mockForm.input).toHaveBeenCalledWith('pwd', 'password', { placeholder: 'p' });
  });

  it('tokenize resolves with form tokens', async () => {
    const { result } = renderHook(() => useSecureForm(), { wrapper });
    await waitFor(() => expect(result.current.isReady).toBe(true));
    const tokens = await result.current.tokenize();
    expect(tokens).toEqual({ password: 'tokenized-value' });
  });
});

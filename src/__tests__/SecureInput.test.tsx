import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, act } from '@testing-library/react';
import { StrictMode } from 'react';
import { SecureInput } from '../components/SecureInput';
import { WeavrProvider } from '../context';
import { mockWeavrClient, mockSecureInput, mockForm } from './setup';

function renderWithProvider(ui: React.ReactElement, strict = false) {
  const tree = (
    <WeavrProvider uiKey="test-key" environment="sandbox">
      {ui}
    </WeavrProvider>
  );
  return render(strict ? <StrictMode>{tree}</StrictMode> : tree);
}

beforeEach(() => {
  vi.clearAllMocks();
});

describe('SecureInput', () => {
  it('renders loading state before client initializes', () => {
    const { getByRole } = renderWithProvider(<SecureInput name="pwd" type="password" />);
    expect(getByRole('status').textContent).toContain('Loading');
  });

  it('forwards ariaLabel to container', async () => {
    const { container } = renderWithProvider(
      <SecureInput name="pwd" type="password" ariaLabel="Password field" />
    );
    await act(async () => {});
    const div = container.querySelector('[aria-label="Password field"]');
    expect(div).toBeTruthy();
  });

  it('creates form and input via client', async () => {
    renderWithProvider(<SecureInput name="pwd" type="password" />);
    await act(async () => {});
    expect(mockWeavrClient.form).toHaveBeenCalled();
    expect(mockForm.input).toHaveBeenCalledWith('pwd', 'password', expect.any(Object));
    expect(mockSecureInput.mount).toHaveBeenCalled();
  });

  it('destroys element and form on unmount', async () => {
    const { unmount } = renderWithProvider(<SecureInput name="pwd" type="password" />);
    await act(async () => {});
    unmount();
    expect(mockSecureInput.destroy).toHaveBeenCalled();
    expect(mockForm.destroy).toHaveBeenCalled();
  });

  it('surfaces cleanup errors via onError instead of swallowing', async () => {
    mockSecureInput.destroy.mockImplementationOnce(() => {
      throw new Error('boom');
    });
    const onError = vi.fn();
    const errSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    const { unmount } = renderWithProvider(
      <SecureInput name="pwd" type="password" onError={onError} />
    );
    await act(async () => {});
    unmount();
    expect(onError).toHaveBeenCalledWith(expect.any(Error));
    errSpy.mockRestore();
  });
});

import { useState, useEffect, useRef, useCallback } from 'react';
import { useWeavr } from '../context';
import type { SecureClient } from '../types';

export interface UseAssociatedClientReturn {
  client: SecureClient | null;
  isAssociated: boolean;
  isAssociating: boolean;
  error: Error | null;
  /** Re-run association (e.g. after token refresh) */
  reassociate: () => void;
}

/**
 * Hook that associates a user token with the Weavr client.
 * Required before using KYB, KYC, or ConsumerKYC components.
 *
 * The token is passed to Weavr as-is — if your token requires a "Bearer " prefix,
 * include it in the value you pass.
 */
export function useAssociatedClient(accessToken: string | undefined): UseAssociatedClientReturn {
  const { client, isInitialized } = useWeavr();
  const [isAssociated, setIsAssociated] = useState(false);
  const [isAssociating, setIsAssociating] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [nonce, setNonce] = useState(0);

  const mountedRef = useRef(true);
  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  useEffect(() => {
    if (!client || !isInitialized || !accessToken) return;

    setIsAssociating(true);
    setIsAssociated(false);
    setError(null);

    client.associate(
      accessToken,
      () => {
        if (!mountedRef.current) return;
        setIsAssociated(true);
        setIsAssociating(false);
      },
      (err: Error) => {
        if (!mountedRef.current) return;
        setError(err instanceof Error ? err : new Error(String(err)));
        setIsAssociating(false);
      }
    );
  }, [client, isInitialized, accessToken, nonce]);

  const reassociate = useCallback(() => {
    setNonce((n) => n + 1);
  }, []);

  return {
    client: isAssociated ? client : null,
    isAssociated,
    isAssociating,
    error,
    reassociate,
  };
}

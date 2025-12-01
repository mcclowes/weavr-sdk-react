import { useState, useEffect } from 'react';
import { useWeavr } from '../context';
import type { SecureClient } from '../types';

export interface UseAssociatedClientReturn {
  client: SecureClient | null;
  isAssociated: boolean;
  isAssociating: boolean;
  error: Error | null;
}

/**
 * Hook that associates a user token with the Weavr client.
 * Required before using KYB, KYC, or ConsumerKYC components.
 */
export function useAssociatedClient(accessToken: string | undefined): UseAssociatedClientReturn {
  const { client, isInitialized } = useWeavr();
  const [isAssociated, setIsAssociated] = useState(false);
  const [isAssociating, setIsAssociating] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!client || !isInitialized || !accessToken) return;

    setIsAssociating(true);
    setError(null);

    const token = accessToken.startsWith('Bearer ') ? accessToken : `Bearer ${accessToken}`;

    client.associate(
      token,
      () => {
        setIsAssociated(true);
        setIsAssociating(false);
      },
      (err: Error) => {
        setError(err);
        setIsAssociating(false);
      }
    );
  }, [client, isInitialized, accessToken]);

  return {
    client: isAssociated ? client : null,
    isAssociated,
    isAssociating,
    error,
  };
}

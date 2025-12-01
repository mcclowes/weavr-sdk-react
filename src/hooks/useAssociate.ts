import { useState, useCallback } from 'react';
import { associateUserToken, setUserToken } from '../client';

export interface UseAssociateReturn {
  associate: (authToken: string) => Promise<void>;
  isAssociating: boolean;
  error: Error | null;
  isAssociated: boolean;
}

export function useAssociate(): UseAssociateReturn {
  const [isAssociating, setIsAssociating] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [isAssociated, setIsAssociated] = useState(false);

  const associate = useCallback(async (authToken: string) => {
    setIsAssociating(true);
    setError(null);

    try {
      await associateUserToken(authToken);
      setIsAssociated(true);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to associate user token'));
      throw err;
    } finally {
      setIsAssociating(false);
    }
  }, []);

  return {
    associate,
    isAssociating,
    error,
    isAssociated,
  };
}

export interface UseSetUserTokenReturn {
  setToken: (authToken: string) => Promise<void>;
  isSettingToken: boolean;
  error: Error | null;
  isTokenSet: boolean;
}

export function useSetUserToken(): UseSetUserTokenReturn {
  const [isSettingToken, setIsSettingToken] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [isTokenSet, setIsTokenSet] = useState(false);

  const setToken = useCallback(async (authToken: string) => {
    setIsSettingToken(true);
    setError(null);

    try {
      await setUserToken(authToken);
      setIsTokenSet(true);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to set user token'));
      throw err;
    } finally {
      setIsSettingToken(false);
    }
  }, []);

  return {
    setToken,
    isSettingToken,
    error,
    isTokenSet,
  };
}

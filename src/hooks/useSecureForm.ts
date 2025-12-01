import { useCallback, useRef } from 'react';
import type { SecureForm, SecureInputElement, SecureInputType, SecureInputOptions } from '../types';
import { useWeavr } from '../context';

export interface UseSecureFormReturn {
  form: SecureForm | null;
  createInput: (
    name: string,
    type: SecureInputType,
    options?: SecureInputOptions
  ) => SecureInputElement | null;
  tokenize: () => Promise<Record<string, string>>;
  destroy: () => void;
  isReady: boolean;
}

export function useSecureForm(): UseSecureFormReturn {
  const { client, isInitialized } = useWeavr();
  const formRef = useRef<SecureForm | null>(null);

  // Lazily create form on first access
  const getForm = useCallback((): SecureForm | null => {
    if (!client || !isInitialized) return null;
    if (!formRef.current) {
      formRef.current = client.form();
    }
    return formRef.current;
  }, [client, isInitialized]);

  const createInput = useCallback(
    (
      name: string,
      type: SecureInputType,
      options?: SecureInputOptions
    ): SecureInputElement | null => {
      const form = getForm();
      if (!form) return null;
      return form.input(name, type, options);
    },
    [getForm]
  );

  const tokenize = useCallback((): Promise<Record<string, string>> => {
    return new Promise((resolve, reject) => {
      const form = getForm();
      if (!form) {
        reject(new Error('Weavr client not initialized'));
        return;
      }
      form.tokenize(resolve);
    });
  }, [getForm]);

  const destroy = useCallback(() => {
    if (formRef.current) {
      formRef.current.destroy();
      formRef.current = null;
    }
  }, []);

  return {
    form: getForm(),
    createInput,
    tokenize,
    destroy,
    isReady: isInitialized,
  };
}

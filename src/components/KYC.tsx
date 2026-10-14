'use client';

import { useRef, useEffect, useMemo } from 'react';
import type { KYCAuthObject, KYCConfig, KYCMessageType } from '../types';
import { useAssociatedClient } from '../hooks/useAssociatedClient';
import { useOptionalWeavrTheme } from '../themeContext';

export interface KYCProps {
  /** Authentication object containing access token */
  auth: KYCAuthObject;
  /** KYC UI configuration options */
  config?: KYCConfig;
  /** CSS class name for the container div */
  className?: string;
  /** Inline styles for the container div */
  style?: React.CSSProperties;
  /** Whether to use theme styles (default: true if theme provider exists) */
  useTheme?: boolean;
  /** Called when KYC process completes successfully */
  onComplete?: (payload: unknown) => void;
  /** Called when user closes the KYC flow */
  onClose?: (payload: unknown) => void;
  /** Called on error */
  onError?: (payload: unknown) => void;
  /** Called when step changes */
  onStepChange?: (payload: unknown) => void;
}

export function KYC({
  auth,
  config,
  className,
  style,
  useTheme = true,
  onComplete,
  onClose,
  onError,
  onStepChange,
}: KYCProps) {
  const { client, isAssociated, error: associateError } = useAssociatedClient(auth.accessToken);
  const themeContext = useOptionalWeavrTheme();
  const containerRef = useRef<HTMLDivElement>(null);
  const initializedForAuthRef = useRef<KYCAuthObject | null>(null);

  const callbacksRef = useRef({ onComplete, onClose, onError, onStepChange });
  callbacksRef.current = { onComplete, onClose, onError, onStepChange };

  const mergedConfig = useMemo(() => {
    const baseConfig = { ...config };
    const shouldUseTheme = useTheme && themeContext;
    if (shouldUseTheme) {
      const themeCss = themeContext.getKycCss();
      baseConfig.customCssStr = config?.customCssStr
        ? `${themeCss}\n${config.customCssStr}`
        : themeCss;
    }
    return baseConfig;
  }, [config, useTheme, themeContext]);

  useEffect(() => {
    if (associateError) {
      callbacksRef.current.onError?.(associateError);
    }
  }, [associateError]);

  useEffect(() => {
    if (!containerRef.current || !client || !isAssociated) return;
    if (initializedForAuthRef.current === auth) return;

    const listener = (messageType: KYCMessageType, payload: unknown) => {
      switch (messageType) {
        case 'complete':
          callbacksRef.current.onComplete?.(payload);
          break;
        case 'close':
          callbacksRef.current.onClose?.(payload);
          break;
        case 'error':
          callbacksRef.current.onError?.(payload);
          break;
        case 'step_change':
          callbacksRef.current.onStepChange?.(payload);
          break;
      }
    };

    try {
      client.kyc().init(containerRef.current, auth, listener, mergedConfig);
      initializedForAuthRef.current = auth;
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to initialize KYC');
      console.error('[weavr-sdk-react] KYC init failed:', error);
      callbacksRef.current.onError?.(error);
    }
  }, [client, isAssociated, auth, mergedConfig]);

  if (associateError) {
    return (
      <div className={className} style={style} role="alert">
        Authentication failed: {associateError.message}
      </div>
    );
  }

  if (!isAssociated) {
    return (
      <div className={className} style={style} role="status" aria-live="polite">
        Loading KYC...
      </div>
    );
  }

  return <div ref={containerRef} className={className} style={style} />;
}

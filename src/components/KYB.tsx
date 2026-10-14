'use client';

import { useRef, useEffect, useState, useCallback, useMemo } from 'react';
import type { KYBAuthObject, KYBConfig, KYBMessageType } from '../types';
import { useAssociatedClient } from '../hooks/useAssociatedClient';
import { useWeavr } from '../context';
import { useOptionalWeavrTheme } from '../themeContext';

export interface KYBProps {
  /** Authentication object containing access token */
  auth: KYBAuthObject;
  /** KYB UI configuration options */
  config?: KYBConfig;
  /** CSS class name for the container div */
  className?: string;
  /** Inline styles for the container div */
  style?: React.CSSProperties;
  /** Whether to use theme styles (default: true if theme provider exists) */
  useTheme?: boolean;
  /** Called when KYB process completes successfully */
  onComplete?: (payload: unknown) => void;
  /** Called when user closes the KYB flow */
  onClose?: (payload: unknown) => void;
  /** Called on error */
  onError?: (payload: unknown) => void;
  /** Called when step changes */
  onStepChange?: (payload: unknown) => void;
  /**
   * Handler for manual verification (sandbox only).
   * When provided, shows a "Verify Manually" button.
   */
  onManualVerify?: () => Promise<void>;
}

export function KYB({
  auth,
  config,
  className,
  style,
  useTheme = true,
  onComplete,
  onClose,
  onError,
  onStepChange,
  onManualVerify,
}: KYBProps) {
  const { client, isAssociated, error: associateError } = useAssociatedClient(auth.accessToken);
  const { environment } = useWeavr();
  const themeContext = useOptionalWeavrTheme();
  const containerRef = useRef<HTMLDivElement>(null);
  const initializedForAuthRef = useRef<KYBAuthObject | null>(null);
  const [isManualVerifying, setIsManualVerifying] = useState(false);

  const callbacksRef = useRef({ onComplete, onClose, onError, onStepChange });
  callbacksRef.current = { onComplete, onClose, onError, onStepChange };

  const showManualVerify = environment === 'sandbox' && onManualVerify;

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

  const buttonStyle = useMemo<React.CSSProperties>(() => {
    const baseStyle: React.CSSProperties = {
      marginTop: '16px',
      padding: '8px 16px',
      cursor: isManualVerifying ? 'not-allowed' : 'pointer',
      opacity: isManualVerifying ? 0.6 : 1,
    };

    const shouldUseTheme = useTheme && themeContext;
    if (shouldUseTheme) {
      const { colors, typography, borders } = themeContext;
      return {
        ...baseStyle,
        fontFamily: typography.fontFamily,
        fontSize: typography.fontSizeSmall,
        fontWeight: typography.fontWeightMedium,
        backgroundColor: colors.surface,
        color: colors.text,
        border: `${borders.width} ${borders.style} ${colors.inputBorder}`,
        borderRadius: borders.radius,
      };
    }

    return baseStyle;
  }, [useTheme, themeContext, isManualVerifying]);

  const handleManualVerify = useCallback(async () => {
    if (!onManualVerify) return;

    setIsManualVerifying(true);
    try {
      await onManualVerify();
      callbacksRef.current.onComplete?.({ manualVerification: true });
    } catch (err) {
      callbacksRef.current.onError?.(
        err instanceof Error ? err : new Error('Manual verification failed')
      );
    } finally {
      setIsManualVerifying(false);
    }
  }, [onManualVerify]);

  useEffect(() => {
    if (associateError) {
      callbacksRef.current.onError?.(associateError);
    }
  }, [associateError]);

  useEffect(() => {
    if (!containerRef.current || !client || !isAssociated) return;
    if (initializedForAuthRef.current === auth) return;

    const listener = (messageType: KYBMessageType, payload: unknown) => {
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
      client.kyb().init(containerRef.current, auth, listener, mergedConfig);
      initializedForAuthRef.current = auth;
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to initialize KYB');
      console.error('[weavr-sdk-react] KYB init failed:', error);
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
        Loading KYB...
      </div>
    );
  }

  return (
    <div className={className} style={style}>
      <div ref={containerRef} />
      {showManualVerify && (
        <button
          type="button"
          onClick={handleManualVerify}
          disabled={isManualVerifying}
          style={buttonStyle}
        >
          {isManualVerifying ? 'Verifying...' : 'Verify Manually (Sandbox)'}
        </button>
      )}
    </div>
  );
}

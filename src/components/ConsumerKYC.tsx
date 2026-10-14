'use client';

import { useRef, useEffect, useMemo } from 'react';
import type { ConsumerKYCMessage } from '../types';
import { useAssociatedClient } from '../hooks/useAssociatedClient';
import { useOptionalWeavrTheme } from '../themeContext';

export interface ConsumerKYCProps {
  /** KYC reference from the API */
  reference: string;
  /** User's access token for authentication */
  accessToken: string;
  /** Language code (ISO 639-1) */
  lang?: string;
  /** URL to custom CSS file */
  customCss?: string;
  /** Inline custom CSS string */
  customCssStr?: string;
  /** CSS class name for the container div */
  className?: string;
  /** Inline styles for the container div */
  style?: React.CSSProperties;
  /** Whether to use theme styles (default: true if theme provider exists) */
  useTheme?: boolean;
  /** Called when KYC status changes (e.g., kycSubmitted) */
  onMessage?: (message: ConsumerKYCMessage) => void;
  /** Called on error */
  onError?: (error: Error) => void;
}

export function ConsumerKYC({
  reference,
  accessToken,
  lang,
  customCss,
  customCssStr,
  className,
  style,
  useTheme = true,
  onMessage,
  onError,
}: ConsumerKYCProps) {
  const { client, isAssociated, error: associateError } = useAssociatedClient(accessToken);
  const themeContext = useOptionalWeavrTheme();
  const containerRef = useRef<HTMLDivElement>(null);
  const initializedKeyRef = useRef<string | null>(null);

  const callbacksRef = useRef({ onMessage, onError });
  callbacksRef.current = { onMessage, onError };

  // Merge theme CSS with custom CSS
  const mergedCustomCssStr = useMemo(() => {
    // Apply theme CSS if available and useTheme is true
    const shouldUseTheme = useTheme && themeContext;
    if (shouldUseTheme) {
      const themeCss = themeContext.getKycCss();
      // Merge: theme CSS first, then user's custom CSS
      return customCssStr ? `${themeCss}\n${customCssStr}` : themeCss;
    }
    return customCssStr;
  }, [useTheme, themeContext, customCssStr]);

  useEffect(() => {
    if (associateError) {
      callbacksRef.current.onError?.(associateError);
    }
  }, [associateError]);

  useEffect(() => {
    if (!containerRef.current || !client || !isAssociated) return;
    const key = `${reference}|${lang ?? ''}|${customCss ?? ''}|${mergedCustomCssStr ?? ''}`;
    if (initializedKeyRef.current === key) return;

    try {
      client.consumer_kyc().init({
        selector: containerRef.current,
        reference,
        lang,
        customCss,
        customCssStr: mergedCustomCssStr,
        onMessage: (msg) => callbacksRef.current.onMessage?.(msg),
        onError: (err) => callbacksRef.current.onError?.(err),
      });
      initializedKeyRef.current = key;
    } catch (err) {
      const e = err instanceof Error ? err : new Error('Failed to initialize Consumer KYC');
      console.error('[weavr-sdk-react] ConsumerKYC init failed:', e);
      callbacksRef.current.onError?.(e);
    }
  }, [client, isAssociated, reference, lang, customCss, mergedCustomCssStr]);

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

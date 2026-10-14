'use client';

import { useRef, useEffect, useImperativeHandle, forwardRef, useState, useMemo } from 'react';
import type { SecureSpanElement, SecureSpanType, SecureElementStyles } from '../types';
import { useWeavr } from '../context';
import { useOptionalWeavrTheme } from '../themeContext';

export interface SecureSpanProps {
  /** Type of secure span: cardNumber, cvv, or cardPin */
  type: SecureSpanType;
  /** Token for the sensitive data to display */
  token: string;
  /** Weavr style options */
  weavrStyle?: SecureElementStyles;
  /** CSS class name for the container div */
  className?: string;
  /** Inline styles for the container div */
  containerStyle?: React.CSSProperties;
  /** Whether to use theme styles (default: true if theme provider exists) */
  useTheme?: boolean;
  /** Style overrides to apply on top of theme styles */
  styleOverrides?: SecureElementStyles;
  /** Accessible label announced to screen readers */
  ariaLabel?: string;
  /** Called when the span is ready */
  onReady?: () => void;
  /** Called when the displayed value changes */
  onChange?: () => void;
  /** Called on initialization or cleanup errors */
  onError?: (error: Error) => void;
}

export interface SecureSpanRef {
  /** Get the underlying Weavr element */
  getElement: () => SecureSpanElement | null;
}

export const SecureSpan = forwardRef<SecureSpanRef, SecureSpanProps>(function SecureSpan(
  {
    type,
    token,
    weavrStyle,
    className,
    containerStyle,
    useTheme = true,
    styleOverrides,
    ariaLabel,
    onReady,
    onChange,
    onError,
  },
  ref
) {
  const { client, isInitialized } = useWeavr();
  const themeContext = useOptionalWeavrTheme();
  const containerRef = useRef<HTMLDivElement>(null);
  const elementRef = useRef<SecureSpanElement | null>(null);
  const [error, setError] = useState<string | null>(null);

  const callbacksRef = useRef({ onReady, onChange, onError });
  callbacksRef.current = { onReady, onChange, onError };

  const mergedStyle = useMemo(() => {
    const shouldUseTheme = useTheme && themeContext;
    const themeStyles = shouldUseTheme ? themeContext.getSpanStyles(type) : null;

    let result: SecureElementStyles | undefined;

    if (themeStyles) {
      result = { base: { ...themeStyles.base } };
    }

    if (weavrStyle) {
      result = result
        ? { base: { ...result.base, ...weavrStyle.base } }
        : { base: { ...weavrStyle.base } };
    }

    if (styleOverrides) {
      result = result
        ? { base: { ...result.base, ...styleOverrides.base } }
        : { base: { ...styleOverrides.base } };
    }

    return result;
  }, [type, useTheme, themeContext, weavrStyle, styleOverrides]);

  const styleKey = useMemo(() => JSON.stringify(mergedStyle), [mergedStyle]);

  useImperativeHandle(ref, () => ({
    getElement: () => elementRef.current,
  }));

  useEffect(() => {
    if (!containerRef.current || !token || !client || !isInitialized) return;

    let element: SecureSpanElement | null = null;
    const parsedStyle = styleKey ? JSON.parse(styleKey) : undefined;

    try {
      element = client.span(type, token, parsedStyle ? { style: parsedStyle } : undefined);
      elementRef.current = element;
      setError(null);

      element.on('ready', () => callbacksRef.current.onReady?.());
      element.on('change', () => callbacksRef.current.onChange?.());

      element.mount(containerRef.current);
    } catch (err) {
      const e = err instanceof Error ? err : new Error('Failed to create secure span');
      console.error('[weavr-sdk-react] SecureSpan init failed:', e);
      setError(e.message);
      callbacksRef.current.onError?.(e);
      return;
    }

    return () => {
      try {
        elementRef.current?.destroy();
      } catch (err) {
        const e = err instanceof Error ? err : new Error(String(err));
        console.error('[weavr-sdk-react] SecureSpan destroy failed:', e);
        callbacksRef.current.onError?.(e);
      }
      elementRef.current = null;
    };
  }, [client, isInitialized, type, token, styleKey]);

  if (!isInitialized) {
    return (
      <div className={className} style={containerStyle} role="status" aria-live="polite">
        Loading...
      </div>
    );
  }

  if (error) {
    return (
      <div
        className={className}
        style={{ ...containerStyle, color: '#dc3545', fontSize: 14 }}
        role="alert"
      >
        {error}
      </div>
    );
  }

  return (
    <div ref={containerRef} className={className} style={containerStyle} aria-label={ariaLabel} />
  );
});

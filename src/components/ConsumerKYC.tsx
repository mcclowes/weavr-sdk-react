import { useRef, useEffect, useMemo } from 'react'
import type { ConsumerKYCMessage } from '../types'
import { useAssociatedClient } from '../hooks/useAssociatedClient'
import { useOptionalWeavrTheme } from '../themeContext'

export interface ConsumerKYCProps {
  /** KYC reference from the API */
  reference: string
  /** User's access token for authentication */
  accessToken: string
  /** Language code (ISO 639-1) */
  lang?: string
  /** URL to custom CSS file */
  customCss?: string
  /** Inline custom CSS string */
  customCssStr?: string
  /** CSS class name for the container div */
  className?: string
  /** Inline styles for the container div */
  style?: React.CSSProperties
  /** Whether to use theme styles (default: true if theme provider exists) */
  useTheme?: boolean
  /** Called when KYC status changes (e.g., kycSubmitted) */
  onMessage?: (message: ConsumerKYCMessage) => void
  /** Called on error */
  onError?: (error: Error) => void
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
  const { client, isAssociated, error: associateError } = useAssociatedClient(accessToken)
  const themeContext = useOptionalWeavrTheme()
  const containerRef = useRef<HTMLDivElement>(null)
  const initializedRef = useRef(false)

  // Merge theme CSS with custom CSS
  const mergedCustomCssStr = useMemo(() => {
    // Apply theme CSS if available and useTheme is true
    const shouldUseTheme = useTheme && themeContext
    if (shouldUseTheme) {
      const themeCss = themeContext.getKycCss()
      // Merge: theme CSS first, then user's custom CSS
      return customCssStr ? `${themeCss}\n${customCssStr}` : themeCss
    }
    return customCssStr
  }, [useTheme, themeContext, customCssStr])

  // Report association errors
  useEffect(() => {
    if (associateError) {
      onError?.(associateError)
    }
  }, [associateError, onError])

  // Initialize Consumer KYC once associated
  useEffect(() => {
    if (!containerRef.current || !client || !isAssociated || initializedRef.current) return

    try {
      client.consumer_kyc().init({
        selector: containerRef.current,
        reference,
        lang,
        customCss,
        customCssStr: mergedCustomCssStr,
        onMessage,
        onError,
      })
      initializedRef.current = true
    } catch (error) {
      onError?.(error instanceof Error ? error : new Error('Failed to initialize Consumer KYC'))
    }
  }, [client, isAssociated, reference, lang, customCss, mergedCustomCssStr, onMessage, onError])

  if (associateError) {
    return (
      <div className={className} style={style}>
        Authentication failed: {associateError.message}
      </div>
    )
  }

  if (!isAssociated) {
    return (
      <div className={className} style={style}>
        Loading KYC...
      </div>
    )
  }

  return <div ref={containerRef} className={className} style={style} />
}

import { useRef, useEffect } from 'react'
import type { ConsumerKYCMessage } from '../types'
import { useAssociatedClient } from '../hooks/useAssociatedClient'

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
  onMessage,
  onError,
}: ConsumerKYCProps) {
  const { client, isAssociated, error: associateError } = useAssociatedClient(accessToken)
  const containerRef = useRef<HTMLDivElement>(null)
  const initializedRef = useRef(false)

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
        customCssStr,
        onMessage,
        onError,
      })
      initializedRef.current = true
    } catch (error) {
      onError?.(error instanceof Error ? error : new Error('Failed to initialize Consumer KYC'))
    }
  }, [client, isAssociated, reference, lang, customCss, customCssStr, onMessage, onError])

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

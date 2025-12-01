import { useRef, useEffect } from 'react'
import type { KYCAuthObject, KYCConfig, KYCMessageType } from '../types'
import { useAssociatedClient } from '../hooks/useAssociatedClient'

export interface KYCProps {
  /** Authentication object containing access token */
  auth: KYCAuthObject
  /** KYC UI configuration options */
  config?: KYCConfig
  /** CSS class name for the container div */
  className?: string
  /** Inline styles for the container div */
  style?: React.CSSProperties
  /** Called when KYC process completes successfully */
  onComplete?: (payload: unknown) => void
  /** Called when user closes the KYC flow */
  onClose?: (payload: unknown) => void
  /** Called on error */
  onError?: (payload: unknown) => void
  /** Called when step changes */
  onStepChange?: (payload: unknown) => void
}

export function KYC({
  auth,
  config,
  className,
  style,
  onComplete,
  onClose,
  onError,
  onStepChange,
}: KYCProps) {
  const { client, isAssociated, error: associateError } = useAssociatedClient(auth.accessToken)
  const containerRef = useRef<HTMLDivElement>(null)
  const initializedRef = useRef(false)

  // Report association errors
  useEffect(() => {
    if (associateError) {
      onError?.(associateError)
    }
  }, [associateError, onError])

  // Initialize KYC once associated
  useEffect(() => {
    if (!containerRef.current || !client || !isAssociated || initializedRef.current) return

    const listener = (messageType: KYCMessageType, payload: unknown) => {
      switch (messageType) {
        case 'complete':
          onComplete?.(payload)
          break
        case 'close':
          onClose?.(payload)
          break
        case 'error':
          onError?.(payload)
          break
        case 'step_change':
          onStepChange?.(payload)
          break
      }
    }

    client.kyc().init(containerRef.current, auth, listener, config ?? {})
    initializedRef.current = true
  }, [client, isAssociated, auth, config, onComplete, onClose, onError, onStepChange])

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

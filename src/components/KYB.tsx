import { useRef, useEffect, useState, useCallback } from 'react'
import type { KYBAuthObject, KYBConfig, KYBMessageType } from '../types'
import { useAssociatedClient } from '../hooks/useAssociatedClient'
import { useWeavr } from '../context'

export interface KYBProps {
  /** Authentication object containing access token */
  auth: KYBAuthObject
  /** KYB UI configuration options */
  config?: KYBConfig
  /** CSS class name for the container div */
  className?: string
  /** Inline styles for the container div */
  style?: React.CSSProperties
  /** Called when KYB process completes successfully */
  onComplete?: (payload: unknown) => void
  /** Called when user closes the KYB flow */
  onClose?: (payload: unknown) => void
  /** Called on error */
  onError?: (payload: unknown) => void
  /** Called when step changes */
  onStepChange?: (payload: unknown) => void
  /**
   * Handler for manual verification (sandbox only).
   * When provided, shows a "Verify Manually" button.
   * Implement this to call your backend which then calls:
   * POST https://sandbox.weavr.io/simulate/api/corporates/{corporateId}/verify
   * with header: programme-key: {your-programme-key}
   */
  onManualVerify?: () => Promise<void>
}

export function KYB({
  auth,
  config,
  className,
  style,
  onComplete,
  onClose,
  onError,
  onStepChange,
  onManualVerify,
}: KYBProps) {
  const { client, isAssociated, error: associateError } = useAssociatedClient(auth.accessToken)
  const { environment } = useWeavr()
  const containerRef = useRef<HTMLDivElement>(null)
  const initializedRef = useRef(false)
  const [isManualVerifying, setIsManualVerifying] = useState(false)

  const showManualVerify = environment === 'sandbox' && onManualVerify

  const handleManualVerify = useCallback(async () => {
    if (!onManualVerify) return

    setIsManualVerifying(true)
    try {
      await onManualVerify()
      onComplete?.({ manualVerification: true })
    } catch (err) {
      onError?.(err instanceof Error ? err : new Error('Manual verification failed'))
    } finally {
      setIsManualVerifying(false)
    }
  }, [onManualVerify, onComplete, onError])

  // Report association errors
  useEffect(() => {
    if (associateError) {
      onError?.(associateError)
    }
  }, [associateError, onError])

  // Initialize KYB once associated
  useEffect(() => {
    if (!containerRef.current || !client || !isAssociated || initializedRef.current) return

    const listener = (messageType: KYBMessageType, payload: unknown) => {
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

    client.kyb().init(containerRef.current, auth, listener, config ?? {})
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
        Loading KYB...
      </div>
    )
  }

  return (
    <div className={className} style={style}>
      <div ref={containerRef} />
      {showManualVerify && (
        <button
          type="button"
          onClick={handleManualVerify}
          disabled={isManualVerifying}
          style={{
            marginTop: '16px',
            padding: '8px 16px',
            cursor: isManualVerifying ? 'not-allowed' : 'pointer',
            opacity: isManualVerifying ? 0.6 : 1,
          }}
        >
          {isManualVerifying ? 'Verifying...' : 'Verify Manually (Sandbox)'}
        </button>
      )}
    </div>
  )
}

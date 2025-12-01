import {
  useRef,
  useEffect,
  useImperativeHandle,
  forwardRef,
  useState,
  useMemo,
} from 'react'
import type { SecureSpanElement, SecureSpanType, SecureElementStyles } from '../types'
import { useWeavr } from '../context'

export interface SecureSpanProps {
  /** Type of secure span: cardNumber, cvv, or cardPin */
  type: SecureSpanType
  /** Token for the sensitive data to display */
  token: string
  /** Weavr style options */
  weavrStyle?: SecureElementStyles
  /** CSS class name for the container div */
  className?: string
  /** Inline styles for the container div */
  containerStyle?: React.CSSProperties
  /** Called when the span is ready */
  onReady?: () => void
  /** Called when the displayed value changes */
  onChange?: () => void
}

export interface SecureSpanRef {
  /** Get the underlying Weavr element */
  getElement: () => SecureSpanElement | null
}

export const SecureSpan = forwardRef<SecureSpanRef, SecureSpanProps>(
  function SecureSpan(
    { type, token, weavrStyle, className, containerStyle, onReady, onChange },
    ref
  ) {
    const { client, isInitialized } = useWeavr()
    const containerRef = useRef<HTMLDivElement>(null)
    const elementRef = useRef<SecureSpanElement | null>(null)
    const [error, setError] = useState<string | null>(null)

    // Store callbacks in refs so they don't trigger re-renders
    const callbacksRef = useRef({ onReady, onChange })
    callbacksRef.current = { onReady, onChange }

    // Stabilize weavrStyle by serializing
    const styleKey = useMemo(() => JSON.stringify(weavrStyle), [weavrStyle])

    useImperativeHandle(ref, () => ({
      getElement: () => elementRef.current,
    }))

    useEffect(() => {
      // SecureSpan requires stepped-up authentication (associate() must be called first)
      if (!containerRef.current || !token || !client || !isInitialized) return

      let element: SecureSpanElement | null = null
      const parsedStyle = styleKey ? JSON.parse(styleKey) : undefined

      try {
        // Use the correct Weavr SDK API: client.span(type, token)
        element = client.span(type, token, parsedStyle ? { style: parsedStyle } : undefined)
        elementRef.current = element
        setError(null)

        // Attach event listeners using refs
        element.on('ready', () => callbacksRef.current.onReady?.())
        element.on('change', () => callbacksRef.current.onChange?.())

        element.mount(containerRef.current)
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to create secure span'
        setError(message)
        return
      }

      return () => {
        try {
          if (elementRef.current) {
            elementRef.current.destroy()
          }
        } catch {
          // Ignore cleanup errors
        }
        elementRef.current = null
      }
    }, [client, isInitialized, type, token, styleKey])

    if (!isInitialized) {
      return (
        <div className={className} style={containerStyle}>
          Loading...
        </div>
      )
    }

    if (error) {
      return (
        <div className={className} style={{ ...containerStyle, color: '#dc3545', fontSize: 14 }}>
          {error}
        </div>
      )
    }

    return <div ref={containerRef} className={className} style={containerStyle} />
  }
)

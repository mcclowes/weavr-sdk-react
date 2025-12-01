import {
  createContext,
  useContext,
  useEffect,
  useState,
  useMemo,
  type ReactNode,
} from 'react'
import type { SecureClient, InitOptions } from './types'
import { initWeavr, type WeavrEnvironment } from './client'

export interface WeavrContextValue {
  client: SecureClient | null
  isLoading: boolean
  error: Error | null
  isInitialized: boolean
  environment: WeavrEnvironment
}

const WeavrContext = createContext<WeavrContextValue | null>(null)

export interface WeavrProviderProps {
  children: ReactNode
  uiKey: string
  environment?: WeavrEnvironment
  customScriptUrl?: string
  fonts?: InitOptions['fonts']
}

export function WeavrProvider({
  children,
  uiKey,
  environment = 'sandbox',
  customScriptUrl,
  fonts,
}: WeavrProviderProps) {
  const [client, setClient] = useState<SecureClient | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    let mounted = true

    async function init() {
      try {
        const weavrClient = await initWeavr({
          uiKey,
          environment,
          customScriptUrl,
          fonts,
        })
        if (mounted) {
          setClient(weavrClient)
          setIsLoading(false)
        }
      } catch (err) {
        if (mounted) {
          setError(err instanceof Error ? err : new Error('Failed to initialize Weavr'))
          setIsLoading(false)
        }
      }
    }

    init()

    return () => {
      mounted = false
    }
  }, [uiKey, environment, customScriptUrl, fonts])

  const value = useMemo<WeavrContextValue>(
    () => ({
      client,
      isLoading,
      error,
      isInitialized: client !== null,
      environment,
    }),
    [client, isLoading, error, environment]
  )

  return <WeavrContext.Provider value={value}>{children}</WeavrContext.Provider>
}

export function useWeavr(): WeavrContextValue {
  const context = useContext(WeavrContext)
  if (!context) {
    throw new Error('useWeavr must be used within a WeavrProvider')
  }
  return context
}

export function useWeavrClient(): SecureClient {
  const { client, isInitialized } = useWeavr()
  if (!isInitialized || !client) {
    throw new Error('Weavr client not initialized. Wait for isLoading to be false.')
  }
  return client
}

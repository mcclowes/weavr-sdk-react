// Core client functions
export {
  initWeavr,
  loadWeavrClient,
  getWeavrClient,
  associateUserToken,
  setUserToken,
  type WeavrEnvironment,
  type WeavrInitConfig,
} from './client'

// React context and provider
export {
  WeavrProvider,
  useWeavr,
  useWeavrClient,
  type WeavrContextValue,
  type WeavrProviderProps,
} from './context'

// React hooks
export {
  useSecureForm,
  useAssociate,
  useSetUserToken,
  useAssociatedClient,
  type UseSecureFormReturn,
  type UseAssociateReturn,
  type UseSetUserTokenReturn,
  type UseAssociatedClientReturn,
} from './hooks'

// React components
export {
  SecureInput,
  SecureSpan,
  KYB,
  KYC,
  ConsumerKYC,
  type SecureInputProps,
  type SecureInputRef,
  type SecureSpanProps,
  type SecureSpanRef,
  type KYBProps,
  type KYCProps,
  type ConsumerKYCProps,
} from './components'

// Types
export type {
  SecureClient,
  SecureForm,
  SecureInputElement,
  SecureSpanElement,
  SecureInputType,
  SecureSpanType,
  SecureInputOptions,
  SecureSpanOptions,
  SecureElementStyle,
  SecureElementStyleWithPseudoClasses,
  SecureElementStyles,
  SecureInputChangeEvent,
  SecureInputEventData,
  SecureInputStrengthEvent,
  InitOptions,
  FontOptions,
  KYBAuthObject,
  KYBConfig,
  KYBMessageType,
  KYCAuthObject,
  KYCConfig,
  KYCMessageType,
  ConsumerKYCOptions,
  ConsumerKYCMessage,
} from './types'

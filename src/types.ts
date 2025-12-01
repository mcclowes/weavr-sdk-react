/**
 * Weavr Secure Client TypeScript definitions
 * Based on window.OpcUxSecureClient API
 */

// Style types
export interface SecureElementStyle {
  color?: string
  fontSize?: string
  fontFamily?: string
  fontWeight?: string
  fontStyle?: string
  textAlign?: string
  textDecoration?: string
  textTransform?: string
  letterSpacing?: string
  lineHeight?: string
  padding?: string
  margin?: string
  backgroundColor?: string
  border?: string
  borderRadius?: string
}

export interface SecureElementStyleWithPseudoClasses extends SecureElementStyle {
  ':hover'?: SecureElementStyle
  ':focus'?: SecureElementStyle
  '::placeholder'?: SecureElementStyle
  '::selection'?: SecureElementStyle
  ':-webkit-autofill'?: SecureElementStyle
}

export interface SecureElementStyles {
  base?: SecureElementStyleWithPseudoClasses
  empty?: SecureElementStyleWithPseudoClasses
  valid?: SecureElementStyleWithPseudoClasses
  invalid?: SecureElementStyleWithPseudoClasses
}

// Font options
export interface FontOptions {
  cssSrc?: string
}

export interface InitOptions {
  fonts?: FontOptions[]
}

// Input types - must match Weavr SDK type names exactly
export type SecureInputType =
  | 'password'
  | 'confirmPassword'
  | 'passCode'
  | 'confirmPassCode'
  | 'cardPin'

export type SecureSpanType =
  | 'cardNumber'
  | 'cvv'
  | 'cardPin'

// Input options
export interface SecureInputOptions {
  placeholder?: string
  maxlength?: number
  style?: SecureElementStyles
  classNames?: {
    base?: string
    empty?: string
    focus?: string
    valid?: string
    invalid?: string
    autofill?: string
  }
}

// Span options (for displaying sensitive data)
export interface SecureSpanOptions {
  token: string
  style?: SecureElementStyles
}

// Event data types
export interface SecureInputEventData {
  empty: boolean
  valid: boolean
  invalid: boolean
  autofill: boolean
}

export interface SecureInputChangeEvent extends SecureInputEventData {
  length: number
}

export interface SecureInputStrengthEvent {
  strength: 'weak' | 'fair' | 'strong'
  score: number
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyFunction = (...args: any[]) => void

// Secure input element interface
export interface SecureInputElement {
  mount(element: HTMLElement | string): void
  unmount(): void
  destroy(): void
  on(event: 'ready', callback: () => void): void
  on(event: 'change', callback: (data: SecureInputChangeEvent) => void): void
  on(event: 'focus', callback: () => void): void
  on(event: 'blur', callback: () => void): void
  on(event: 'keyup', callback: (event: KeyboardEvent) => void): void
  on(event: 'strength', callback: (data: SecureInputStrengthEvent) => void): void
  focus(): void
  blur(): void
  clear(): void
}

// Secure span element interface (for displaying card data)
export interface SecureSpanElement {
  mount(element: HTMLElement | string): void
  unmount(): void
  destroy(): void
  on(event: 'ready', callback: () => void): void
  on(event: 'change', callback: () => void): void
}

// Secure form interface
export interface SecureForm {
  input(name: string, type: SecureInputType, options?: SecureInputOptions): SecureInputElement
  tokenize(callback: (tokens: Record<string, string>) => void): void
  destroy(): void
}

// KYC/KYB types
export interface KYBAuthObject {
  externalUserId?: string
  accessToken?: string
  reference?: string
}

export interface KYCAuthObject {
  externalUserId?: string
  accessToken?: string
  reference?: string
}

export type KYBMessageType =
  | 'complete'
  | 'close'
  | 'error'
  | 'step_change'

export type KYCMessageType =
  | 'complete'
  | 'close'
  | 'error'
  | 'step_change'

export interface KYBConfig {
  customCss?: string
  customCssStr?: string
  lang?: string
  hideSteps?: boolean
}

export interface KYCConfig {
  customCss?: string
  customCssStr?: string
  lang?: string
  hideSteps?: boolean
}

export interface KYBModule {
  init(
    selector: string | HTMLElement,
    options: KYBAuthObject,
    listener: (messageType: KYBMessageType, payload: unknown) => void,
    config?: KYBConfig
  ): void
}

export interface KYCModule {
  init(
    selector: string | HTMLElement,
    options: KYCAuthObject,
    listener: (messageType: KYCMessageType, payload: unknown) => void,
    config?: KYCConfig
  ): void
}

// Consumer KYC types (different from Director KYC)
export interface ConsumerKYCOptions {
  selector: string | HTMLElement
  reference: string
  lang?: string
  customCss?: string
  customCssStr?: string
  onMessage?: (message: ConsumerKYCMessage) => void
  onError?: (error: Error) => void
}

export interface ConsumerKYCMessage {
  type: 'kycSubmitted' | 'kycApproved' | 'kycRejected' | string
  payload?: unknown
}

export interface ConsumerKYCModule {
  init(options: ConsumerKYCOptions): void
}

// Display module for showing sensitive data
export interface DisplayModule {
  cardNumber(options: SecureSpanOptions): SecureSpanElement
  cvv(options: SecureSpanOptions): SecureSpanElement
  cardPin(options: SecureSpanOptions): SecureSpanElement
}

// Span options for creating secure spans
export interface SpanOptions {
  style?: SecureElementStyles
}

// Main secure client interface
export interface SecureClient {
  init(uiKey: string, options?: InitOptions): void
  associate(
    authToken: string,
    onSuccess: () => void,
    onError: (error: Error) => void
  ): void
  setUserToken(
    authToken: string,
    onSuccess: () => void,
    onError: (error: Error) => void
  ): void
  form(): SecureForm
  span(type: SecureSpanType, token: string, options?: SpanOptions): SecureSpanElement
  kyb(): KYBModule
  kyc(): KYCModule
  consumer_kyc(): ConsumerKYCModule
  display: DisplayModule
}

// Global declaration for window.OpcUxSecureClient
declare global {
  interface Window {
    OpcUxSecureClient?: SecureClient
  }
}

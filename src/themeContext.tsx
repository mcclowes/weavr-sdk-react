/**
 * Weavr Theme Context
 *
 * Provides theme configuration to all Weavr components.
 * Can be used standalone or alongside WeavrProvider.
 */

import {
  createContext,
  useContext,
  useState,
  useCallback,
  useMemo,
  type ReactNode,
} from 'react'
import type {
  WeavrTheme,
  ThemeColors,
  ThemeTypography,
  ThemeSpacing,
  ThemeBorders,
  ThemeShadows,
} from './theme'
import {
  lightTheme,
  darkTheme,
  createTheme,
  themeToInputStyles,
  themeToSpanStyles,
  themeToKycCss,
  themeToContainerStyle,
} from './theme'
import type { SecureElementStyles } from './types'

// ============================================================================
// Context Types
// ============================================================================

export interface WeavrThemeContextValue {
  /** Current active theme */
  theme: WeavrTheme
  /** Theme name */
  themeName: string
  /** Whether dark mode is active */
  isDark: boolean

  // Direct access to theme tokens
  colors: ThemeColors
  typography: ThemeTypography
  spacing: ThemeSpacing
  borders: ThemeBorders
  shadows: ThemeShadows

  // Style getters (pre-computed for performance)
  /** Get Weavr-compatible input styles */
  getInputStyles: () => SecureElementStyles
  /** Get Weavr-compatible span styles for a specific type */
  getSpanStyles: (type?: 'cardNumber' | 'cvv' | 'cardPin') => SecureElementStyles
  /** Get CSS string for KYC/KYB components */
  getKycCss: () => string
  /** Get React CSSProperties for containers */
  getContainerStyle: (variant?: 'input' | 'card' | 'surface') => React.CSSProperties

  // Theme switching
  /** Switch to a different theme */
  setTheme: (theme: WeavrTheme) => void
  /** Toggle between light and dark themes */
  toggleDarkMode: () => void
}

const WeavrThemeContext = createContext<WeavrThemeContextValue | null>(null)

// ============================================================================
// Provider Component
// ============================================================================

export interface WeavrThemeProviderProps {
  children: ReactNode
  /** Initial theme (defaults to lightTheme) */
  theme?: WeavrTheme
  /** Custom light theme for dark mode toggle */
  lightTheme?: WeavrTheme
  /** Custom dark theme for dark mode toggle */
  darkTheme?: WeavrTheme
}

export function WeavrThemeProvider({
  children,
  theme: initialTheme,
  lightTheme: customLightTheme,
  darkTheme: customDarkTheme,
}: WeavrThemeProviderProps) {
  const light = customLightTheme ?? lightTheme
  const dark = customDarkTheme ?? darkTheme
  const [currentTheme, setCurrentTheme] = useState<WeavrTheme>(initialTheme ?? light)

  const isDark = currentTheme.name === 'dark' || currentTheme.name.includes('dark')

  const toggleDarkMode = useCallback(() => {
    setCurrentTheme((current) =>
      current.name === dark.name ? light : dark
    )
  }, [light, dark])

  // Pre-compute styles for performance
  const inputStyles = useMemo(() => themeToInputStyles(currentTheme), [currentTheme])
  const kycCss = useMemo(() => themeToKycCss(currentTheme), [currentTheme])

  const getInputStyles = useCallback(() => inputStyles, [inputStyles])

  const getSpanStyles = useCallback(
    (type?: 'cardNumber' | 'cvv' | 'cardPin') => themeToSpanStyles(currentTheme, type),
    [currentTheme]
  )

  const getKycCss = useCallback(() => kycCss, [kycCss])

  const getContainerStyle = useCallback(
    (variant?: 'input' | 'card' | 'surface') => themeToContainerStyle(currentTheme, variant),
    [currentTheme]
  )

  const value = useMemo<WeavrThemeContextValue>(
    () => ({
      theme: currentTheme,
      themeName: currentTheme.name,
      isDark,
      colors: currentTheme.colors,
      typography: currentTheme.typography,
      spacing: currentTheme.spacing,
      borders: currentTheme.borders,
      shadows: currentTheme.shadows,
      getInputStyles,
      getSpanStyles,
      getKycCss,
      getContainerStyle,
      setTheme: setCurrentTheme,
      toggleDarkMode,
    }),
    [
      currentTheme,
      isDark,
      getInputStyles,
      getSpanStyles,
      getKycCss,
      getContainerStyle,
      toggleDarkMode,
    ]
  )

  return (
    <WeavrThemeContext.Provider value={value}>
      {children}
    </WeavrThemeContext.Provider>
  )
}

// ============================================================================
// Hooks
// ============================================================================

/**
 * Access the Weavr theme context
 * @throws Error if used outside WeavrThemeProvider
 */
export function useWeavrTheme(): WeavrThemeContextValue {
  const context = useContext(WeavrThemeContext)
  if (!context) {
    throw new Error('useWeavrTheme must be used within a WeavrThemeProvider')
  }
  return context
}

/**
 * Access the Weavr theme context (returns null if not in provider)
 * Useful for components that optionally support theming
 */
export function useOptionalWeavrTheme(): WeavrThemeContextValue | null {
  return useContext(WeavrThemeContext)
}

/**
 * Hook to get input styles with optional overrides
 */
export function useThemedInputStyles(
  overrides?: Partial<SecureElementStyles>
): SecureElementStyles {
  const themeContext = useOptionalWeavrTheme()

  return useMemo(() => {
    const baseStyles = themeContext?.getInputStyles() ?? themeToInputStyles(lightTheme)

    if (!overrides) {
      return baseStyles
    }

    // Merge overrides
    return {
      base: { ...baseStyles.base, ...overrides.base },
      empty: { ...baseStyles.empty, ...overrides.empty },
      valid: { ...baseStyles.valid, ...overrides.valid },
      invalid: { ...baseStyles.invalid, ...overrides.invalid },
    }
  }, [themeContext, overrides])
}

/**
 * Hook to get span styles with optional overrides
 */
export function useThemedSpanStyles(
  type?: 'cardNumber' | 'cvv' | 'cardPin',
  overrides?: Partial<SecureElementStyles>
): SecureElementStyles {
  const themeContext = useOptionalWeavrTheme()

  return useMemo(() => {
    const baseStyles =
      themeContext?.getSpanStyles(type) ?? themeToSpanStyles(lightTheme, type)

    if (!overrides) {
      return baseStyles
    }

    return {
      base: { ...baseStyles.base, ...overrides.base },
    }
  }, [themeContext, type, overrides])
}

/**
 * Hook to get KYC/KYB CSS string
 */
export function useThemedKycCss(additionalCss?: string): string {
  const themeContext = useOptionalWeavrTheme()

  return useMemo(() => {
    const baseCss = themeContext?.getKycCss() ?? themeToKycCss(lightTheme)
    return additionalCss ? `${baseCss}\n${additionalCss}` : baseCss
  }, [themeContext, additionalCss])
}

// ============================================================================
// Utility: Combined Provider
// ============================================================================

/**
 * Props for the combined Weavr + Theme provider
 */
export interface WeavrWithThemeProviderProps {
  children: ReactNode
  /** Weavr UI Key */
  uiKey: string
  /** Environment (sandbox or production) */
  environment?: 'sandbox' | 'production'
  /** Custom script URL */
  customScriptUrl?: string
  /** Font options for Weavr */
  fonts?: Array<{ cssSrc?: string }>
  /** Theme configuration */
  theme?: WeavrTheme
  /** Custom light theme */
  lightTheme?: WeavrTheme
  /** Custom dark theme */
  darkTheme?: WeavrTheme
}

// Note: The combined provider component is exported from index.ts
// to avoid circular dependencies with the WeavrProvider
export { createTheme, lightTheme, darkTheme }

/**
 * Weavr Theme System
 *
 * Provides a comprehensive theming solution for Weavr secure components.
 * Themes define design tokens that are converted to Weavr-compatible styles.
 */

import type { SecureElementStyles, SecureElementStyle } from './types'

// ============================================================================
// Color Tokens
// ============================================================================

/**
 * Semantic color palette for the theme
 */
export interface ThemeColors {
  /** Primary brand color */
  primary: string
  /** Primary color for hover states */
  primaryHover: string
  /** Primary color with transparency for focus rings */
  primaryFocusRing: string

  /** Success/valid state color */
  success: string
  /** Success color for borders */
  successBorder: string

  /** Error/invalid state color */
  error: string
  /** Error color for borders */
  errorBorder: string

  /** Warning state color */
  warning: string

  /** Default text color */
  text: string
  /** Secondary/muted text color */
  textMuted: string
  /** Placeholder text color */
  textPlaceholder: string

  /** Input background color */
  inputBackground: string
  /** Input border color */
  inputBorder: string
  /** Input border color on hover */
  inputBorderHover: string
  /** Input border color on focus */
  inputBorderFocus: string

  /** Page/container background */
  background: string
  /** Surface/card background */
  surface: string

  /** Selection background color */
  selection: string
  /** Selection text color */
  selectionText: string

  /** Autofill background color */
  autofill: string
}

// ============================================================================
// Typography Tokens
// ============================================================================

/**
 * Typography settings for the theme
 */
export interface ThemeTypography {
  /** Primary font family for inputs */
  fontFamily: string
  /** Monospace font family for card numbers, CVV */
  fontFamilyMono: string
  /** Base font size */
  fontSize: string
  /** Small font size */
  fontSizeSmall: string
  /** Large font size */
  fontSizeLarge: string
  /** Normal font weight */
  fontWeightNormal: string
  /** Medium font weight */
  fontWeightMedium: string
  /** Bold font weight */
  fontWeightBold: string
  /** Default line height */
  lineHeight: string
  /** Default letter spacing */
  letterSpacing: string
}

// ============================================================================
// Spacing & Border Tokens
// ============================================================================

/**
 * Spacing values for padding and margins
 */
export interface ThemeSpacing {
  /** Extra small spacing (4px) */
  xs: string
  /** Small spacing (8px) */
  sm: string
  /** Medium spacing (12px) */
  md: string
  /** Large spacing (16px) */
  lg: string
  /** Extra large spacing (24px) */
  xl: string
}

/**
 * Border configuration
 */
export interface ThemeBorders {
  /** Border radius for inputs */
  radius: string
  /** Small border radius */
  radiusSmall: string
  /** Large border radius */
  radiusLarge: string
  /** Border width */
  width: string
  /** Border style */
  style: string
}

/**
 * Shadow configuration
 */
export interface ThemeShadows {
  /** Focus ring shadow */
  focusRing: string
  /** Input shadow */
  input: string
  /** Card/elevated surface shadow */
  card: string
}

// ============================================================================
// Component-Specific Styles
// ============================================================================

/**
 * Input component style configuration
 * These are applied directly to Weavr secure inputs
 */
export interface ThemeInputStyles {
  /** Base styles applied to all states */
  base: SecureElementStyle
  /** Styles for empty state */
  empty?: SecureElementStyle
  /** Styles for valid state */
  valid?: SecureElementStyle
  /** Styles for invalid state */
  invalid?: SecureElementStyle
  /** Styles for hover state */
  hover?: SecureElementStyle
  /** Styles for focus state */
  focus?: SecureElementStyle
  /** Styles for placeholder */
  placeholder?: SecureElementStyle
  /** Styles for text selection */
  selection?: SecureElementStyle
  /** Styles for autofilled inputs */
  autofill?: SecureElementStyle
}

/**
 * Span component style configuration
 * These are applied to Weavr secure spans (card number, CVV, etc.)
 */
export interface ThemeSpanStyles {
  /** Base styles for display spans */
  base: SecureElementStyle
  /** Styles specific to card numbers */
  cardNumber?: SecureElementStyle
  /** Styles specific to CVV */
  cvv?: SecureElementStyle
  /** Styles specific to PIN display */
  cardPin?: SecureElementStyle
}

/**
 * KYC/KYB component style configuration
 */
export interface ThemeKycStyles {
  /** Custom CSS string to inject into KYC iframe */
  customCssStr?: string
  /** URL to external CSS file for KYC */
  customCss?: string
}

// ============================================================================
// Main Theme Interface
// ============================================================================

/**
 * Complete Weavr theme configuration
 */
export interface WeavrTheme {
  /** Theme name for identification */
  name: string
  /** Color palette */
  colors: ThemeColors
  /** Typography settings */
  typography: ThemeTypography
  /** Spacing values */
  spacing: ThemeSpacing
  /** Border configuration */
  borders: ThemeBorders
  /** Shadow configuration */
  shadows: ThemeShadows
  /** Pre-configured input styles (optional, generated from tokens if not provided) */
  inputStyles?: ThemeInputStyles
  /** Pre-configured span styles (optional, generated from tokens if not provided) */
  spanStyles?: ThemeSpanStyles
  /** KYC/KYB styles */
  kycStyles?: ThemeKycStyles
}

// ============================================================================
// Pre-built Themes
// ============================================================================

/**
 * Light theme - default Weavr theme
 */
export const lightTheme: WeavrTheme = {
  name: 'light',
  colors: {
    primary: '#3b82f6',
    primaryHover: '#2563eb',
    primaryFocusRing: 'rgba(59, 130, 246, 0.2)',

    success: '#059669',
    successBorder: '#10b981',

    error: '#dc2626',
    errorBorder: '#ef4444',

    warning: '#d97706',

    text: '#111827',
    textMuted: '#6b7280',
    textPlaceholder: '#9ca3af',

    inputBackground: '#ffffff',
    inputBorder: '#d1d5db',
    inputBorderHover: '#9ca3af',
    inputBorderFocus: '#3b82f6',

    background: '#ffffff',
    surface: '#f9fafb',

    selection: '#3b82f6',
    selectionText: '#ffffff',

    autofill: '#fef3c7',
  },
  typography: {
    fontFamily: 'Inter, ui-sans-serif, system-ui, sans-serif',
    fontFamilyMono: 'ui-monospace, SFMono-Regular, "SF Mono", Monaco, Consolas, monospace',
    fontSize: '16px',
    fontSizeSmall: '14px',
    fontSizeLarge: '18px',
    fontWeightNormal: '400',
    fontWeightMedium: '500',
    fontWeightBold: '600',
    lineHeight: '1.5',
    letterSpacing: 'normal',
  },
  spacing: {
    xs: '4px',
    sm: '8px',
    md: '12px',
    lg: '16px',
    xl: '24px',
  },
  borders: {
    radius: '8px',
    radiusSmall: '4px',
    radiusLarge: '12px',
    width: '1px',
    style: 'solid',
  },
  shadows: {
    focusRing: '0 0 0 3px rgba(59, 130, 246, 0.2)',
    input: 'none',
    card: '0 1px 3px rgba(0, 0, 0, 0.1), 0 1px 2px rgba(0, 0, 0, 0.06)',
  },
}

/**
 * Dark theme
 */
export const darkTheme: WeavrTheme = {
  name: 'dark',
  colors: {
    primary: '#60a5fa',
    primaryHover: '#93c5fd',
    primaryFocusRing: 'rgba(96, 165, 250, 0.3)',

    success: '#34d399',
    successBorder: '#10b981',

    error: '#f87171',
    errorBorder: '#ef4444',

    warning: '#fbbf24',

    text: '#f9fafb',
    textMuted: '#9ca3af',
    textPlaceholder: '#6b7280',

    inputBackground: '#1f2937',
    inputBorder: '#374151',
    inputBorderHover: '#4b5563',
    inputBorderFocus: '#60a5fa',

    background: '#111827',
    surface: '#1f2937',

    selection: '#60a5fa',
    selectionText: '#111827',

    autofill: '#374151',
  },
  typography: {
    fontFamily: 'Inter, ui-sans-serif, system-ui, sans-serif',
    fontFamilyMono: 'ui-monospace, SFMono-Regular, "SF Mono", Monaco, Consolas, monospace',
    fontSize: '16px',
    fontSizeSmall: '14px',
    fontSizeLarge: '18px',
    fontWeightNormal: '400',
    fontWeightMedium: '500',
    fontWeightBold: '600',
    lineHeight: '1.5',
    letterSpacing: 'normal',
  },
  spacing: {
    xs: '4px',
    sm: '8px',
    md: '12px',
    lg: '16px',
    xl: '24px',
  },
  borders: {
    radius: '8px',
    radiusSmall: '4px',
    radiusLarge: '12px',
    width: '1px',
    style: 'solid',
  },
  shadows: {
    focusRing: '0 0 0 3px rgba(96, 165, 250, 0.3)',
    input: 'none',
    card: '0 1px 3px rgba(0, 0, 0, 0.3), 0 1px 2px rgba(0, 0, 0, 0.2)',
  },
}

// ============================================================================
// Theme Utilities
// ============================================================================

/**
 * Create a custom theme by extending an existing theme
 */
export function createTheme(
  baseTheme: WeavrTheme,
  overrides: DeepPartial<WeavrTheme>
): WeavrTheme {
  return deepMergeTheme(baseTheme, overrides)
}

/**
 * Convert theme tokens to Weavr SecureElementStyles for inputs
 */
export function themeToInputStyles(theme: WeavrTheme): SecureElementStyles {
  // If theme has pre-configured input styles, convert them
  if (theme.inputStyles) {
    return inputStylesToSecureStyles(theme.inputStyles)
  }

  // Generate from tokens
  const { colors, typography, spacing, borders, shadows } = theme

  return {
    base: {
      color: colors.text,
      fontSize: typography.fontSize,
      fontFamily: typography.fontFamily,
      fontWeight: typography.fontWeightNormal,
      lineHeight: typography.lineHeight,
      letterSpacing: typography.letterSpacing,
      padding: `${spacing.md} ${spacing.lg}`,
      backgroundColor: colors.inputBackground,
      borderColor: colors.inputBorder,
      borderWidth: borders.width,
      borderStyle: borders.style,
      borderRadius: borders.radius,
      boxShadow: shadows.input,
      ':hover': {
        borderColor: colors.inputBorderHover,
      },
      ':focus': {
        borderColor: colors.inputBorderFocus,
        boxShadow: shadows.focusRing,
      },
      '::placeholder': {
        color: colors.textPlaceholder,
      },
      '::selection': {
        backgroundColor: colors.selection,
        color: colors.selectionText,
      },
      ':-webkit-autofill': {
        backgroundColor: colors.autofill,
      },
    },
    empty: {
      color: colors.textMuted,
    },
    valid: {
      color: colors.success,
      borderColor: colors.successBorder,
    },
    invalid: {
      color: colors.error,
      borderColor: colors.errorBorder,
    },
  }
}

/**
 * Convert theme tokens to Weavr SecureElementStyles for spans
 */
export function themeToSpanStyles(
  theme: WeavrTheme,
  type?: 'cardNumber' | 'cvv' | 'cardPin'
): SecureElementStyles {
  // If theme has pre-configured span styles, use them
  if (theme.spanStyles) {
    const baseStyle = { ...theme.spanStyles.base }

    // Merge type-specific styles if available
    if (type && theme.spanStyles[type]) {
      Object.assign(baseStyle, theme.spanStyles[type])
    }

    return { base: baseStyle }
  }

  // Generate from tokens
  const { colors, typography } = theme

  const isMonospace = type === 'cardNumber' || type === 'cvv'

  return {
    base: {
      color: colors.text,
      fontSize: typography.fontSize,
      fontFamily: isMonospace ? typography.fontFamilyMono : typography.fontFamily,
      fontWeight: typography.fontWeightNormal,
      lineHeight: typography.lineHeight,
      letterSpacing: isMonospace ? '1px' : typography.letterSpacing,
    },
  }
}

/**
 * Convert theme to CSS string for KYC/KYB components
 */
export function themeToKycCss(theme: WeavrTheme): string {
  // If theme has pre-configured KYC styles, use them
  if (theme.kycStyles?.customCssStr) {
    return theme.kycStyles.customCssStr
  }

  const { colors, typography, spacing, borders } = theme

  return `
    .kyc-container {
      font-family: ${typography.fontFamily};
      color: ${colors.text};
      background: ${colors.surface};
    }
    .kyc-form {
      padding: ${spacing.xl};
      background: ${colors.surface};
      border-radius: ${borders.radiusLarge};
    }
    .kyc-input {
      font-family: ${typography.fontFamily};
      font-size: ${typography.fontSize};
      color: ${colors.text};
      background: ${colors.inputBackground};
      border: ${borders.width} ${borders.style} ${colors.inputBorder};
      border-radius: ${borders.radius};
      padding: ${spacing.md};
    }
    .kyc-input:focus {
      border-color: ${colors.inputBorderFocus};
      box-shadow: ${theme.shadows.focusRing};
      outline: none;
    }
    .kyc-input:invalid {
      border-color: ${colors.errorBorder};
    }
    .kyc-button {
      font-family: ${typography.fontFamily};
      font-size: ${typography.fontSize};
      font-weight: ${typography.fontWeightMedium};
      background: ${colors.primary};
      color: ${colors.selectionText};
      border: none;
      border-radius: ${borders.radius};
      padding: ${spacing.md} ${spacing.xl};
      cursor: pointer;
    }
    .kyc-button:hover {
      background: ${colors.primaryHover};
    }
    .kyc-button:focus {
      box-shadow: ${theme.shadows.focusRing};
      outline: none;
    }
    .kyc-label {
      font-size: ${typography.fontSizeSmall};
      color: ${colors.textMuted};
      margin-bottom: ${spacing.xs};
    }
    .kyc-error {
      color: ${colors.error};
      font-size: ${typography.fontSizeSmall};
    }
  `.trim()
}

/**
 * Get container styles (React CSSProperties) from theme
 */
export function themeToContainerStyle(
  theme: WeavrTheme,
  variant: 'input' | 'card' | 'surface' = 'input'
): React.CSSProperties {
  const { colors, borders, spacing, shadows } = theme

  switch (variant) {
    case 'card':
      return {
        backgroundColor: colors.surface,
        borderRadius: borders.radiusLarge,
        padding: spacing.lg,
        boxShadow: shadows.card,
      }
    case 'surface':
      return {
        backgroundColor: colors.surface,
        borderRadius: borders.radius,
        padding: spacing.md,
      }
    case 'input':
    default:
      return {
        backgroundColor: colors.inputBackground,
        borderRadius: borders.radius,
      }
  }
}

// ============================================================================
// Internal Helpers
// ============================================================================

/**
 * Convert ThemeInputStyles to SecureElementStyles
 */
function inputStylesToSecureStyles(styles: ThemeInputStyles): SecureElementStyles {
  const result: SecureElementStyles = {
    base: { ...styles.base },
    empty: styles.empty,
    valid: styles.valid,
    invalid: styles.invalid,
  }

  // Add pseudo-classes to base
  if (styles.hover) {
    result.base![':hover'] = styles.hover
  }
  if (styles.focus) {
    result.base![':focus'] = styles.focus
  }
  if (styles.placeholder) {
    result.base!['::placeholder'] = styles.placeholder
  }
  if (styles.selection) {
    result.base!['::selection'] = styles.selection
  }
  if (styles.autofill) {
    result.base![':-webkit-autofill'] = styles.autofill
  }

  return result
}

/**
 * Deep partial type utility
 */
type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P]
}

/**
 * Deep merge utility for themes
 */
function deepMergeTheme(
  target: WeavrTheme,
  source: DeepPartial<WeavrTheme>
): WeavrTheme {
  const result: WeavrTheme = {
    name: source.name ?? target.name,
    colors: { ...target.colors, ...source.colors },
    typography: { ...target.typography, ...source.typography },
    spacing: { ...target.spacing, ...source.spacing },
    borders: { ...target.borders, ...source.borders },
    shadows: { ...target.shadows, ...source.shadows },
  }

  // Handle optional properties
  if (source.inputStyles || target.inputStyles) {
    result.inputStyles = {
      ...target.inputStyles,
      ...source.inputStyles,
      base: {
        ...target.inputStyles?.base,
        ...source.inputStyles?.base,
      },
    }
  }

  if (source.spanStyles || target.spanStyles) {
    result.spanStyles = {
      ...target.spanStyles,
      ...source.spanStyles,
      base: {
        ...target.spanStyles?.base,
        ...source.spanStyles?.base,
      },
    }
  }

  if (source.kycStyles || target.kycStyles) {
    result.kycStyles = {
      ...target.kycStyles,
      ...source.kycStyles,
    }
  }

  return result
}

import { useRef, useEffect, useImperativeHandle, forwardRef, useState, useMemo } from 'react';
import type {
  SecureInputElement,
  SecureInputType,
  SecureInputOptions,
  SecureInputChangeEvent,
  SecureInputStrengthEvent,
  SecureForm,
  SecureElementStyles,
} from '../types';
import { useWeavr } from '../context';
import { useOptionalWeavrTheme } from '../themeContext';

export interface SecureInputProps {
  /** Unique name for this input within the form */
  name: string;
  /** Type of secure input: password, passcode, or cardPin */
  type: SecureInputType;
  /** Weavr input options (placeholder, maxlength, style) */
  options?: SecureInputOptions;
  /** CSS class name for the container div */
  className?: string;
  /** Inline styles for the container div */
  containerStyle?: React.CSSProperties;
  /** Whether to use theme styles (default: true if theme provider exists) */
  useTheme?: boolean;
  /** Style overrides to apply on top of theme styles */
  styleOverrides?: SecureElementStyles;
  /** Called when the input is ready */
  onReady?: () => void;
  /** Called when input value changes */
  onChange?: (data: SecureInputChangeEvent) => void;
  /** Called on focus */
  onFocus?: () => void;
  /** Called on blur */
  onBlur?: () => void;
  /** Called on keyup */
  onKeyUp?: (event: KeyboardEvent) => void;
  /** Called with password strength data (password type only) */
  onStrength?: (data: SecureInputStrengthEvent) => void;
}

export interface SecureInputRef {
  /** Focus the input */
  focus: () => void;
  /** Blur the input */
  blur: () => void;
  /** Clear the input */
  clear: () => void;
  /** Get the underlying Weavr element */
  getElement: () => SecureInputElement | null;
  /** Tokenize the input value - returns tokens keyed by input name */
  tokenize: () => Promise<Record<string, string>>;
}

export const SecureInput = forwardRef<SecureInputRef, SecureInputProps>(function SecureInput(
  {
    name,
    type,
    options,
    className,
    containerStyle,
    useTheme = true,
    styleOverrides,
    onReady,
    onChange,
    onFocus,
    onBlur,
    onKeyUp,
    onStrength,
  },
  ref
) {
  const { client, isInitialized } = useWeavr();
  const themeContext = useOptionalWeavrTheme();
  const containerRef = useRef<HTMLDivElement>(null);
  const elementRef = useRef<SecureInputElement | null>(null);
  const formRef = useRef<SecureForm | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Store callbacks in refs so they don't trigger re-renders
  const callbacksRef = useRef({ onReady, onChange, onFocus, onBlur, onKeyUp, onStrength });
  callbacksRef.current = { onReady, onChange, onFocus, onBlur, onKeyUp, onStrength };

  // Compute merged styles: theme styles -> options.style -> styleOverrides
  const mergedOptions = useMemo(() => {
    const baseOptions = { ...options };

    // Get theme styles if theme is available and useTheme is true
    const shouldUseTheme = useTheme && themeContext;
    const themeStyles = shouldUseTheme ? themeContext.getInputStyles() : null;

    // Merge styles: theme -> options.style -> styleOverrides
    if (themeStyles || styleOverrides) {
      const mergedStyle: SecureElementStyles = {};

      // Start with theme styles
      if (themeStyles) {
        mergedStyle.base = { ...themeStyles.base };
        mergedStyle.empty = { ...themeStyles.empty };
        mergedStyle.valid = { ...themeStyles.valid };
        mergedStyle.invalid = { ...themeStyles.invalid };
      }

      // Apply options.style on top
      if (options?.style) {
        mergedStyle.base = { ...mergedStyle.base, ...options.style.base };
        mergedStyle.empty = { ...mergedStyle.empty, ...options.style.empty };
        mergedStyle.valid = { ...mergedStyle.valid, ...options.style.valid };
        mergedStyle.invalid = { ...mergedStyle.invalid, ...options.style.invalid };
      }

      // Apply styleOverrides on top
      if (styleOverrides) {
        mergedStyle.base = { ...mergedStyle.base, ...styleOverrides.base };
        mergedStyle.empty = { ...mergedStyle.empty, ...styleOverrides.empty };
        mergedStyle.valid = { ...mergedStyle.valid, ...styleOverrides.valid };
        mergedStyle.invalid = { ...mergedStyle.invalid, ...styleOverrides.invalid };
      }

      baseOptions.style = mergedStyle;
    }

    return baseOptions;
  }, [options, useTheme, themeContext, styleOverrides]);

  // Stabilize options by serializing - only recreate input if options actually change
  const optionsKey = useMemo(() => JSON.stringify(mergedOptions), [mergedOptions]);

  useImperativeHandle(ref, () => ({
    focus: () => elementRef.current?.focus(),
    blur: () => elementRef.current?.blur(),
    clear: () => elementRef.current?.clear(),
    getElement: () => elementRef.current,
    tokenize: () => {
      return new Promise<Record<string, string>>((resolve, reject) => {
        if (!formRef.current) {
          reject(new Error('Form not initialized'));
          return;
        }
        formRef.current.tokenize((tokens) => {
          resolve(tokens);
        });
      });
    },
  }));

  useEffect(() => {
    if (!containerRef.current || !client || !isInitialized) return;

    let form: SecureForm | null = null;
    let element: SecureInputElement | null = null;
    const parsedOptions = optionsKey ? JSON.parse(optionsKey) : undefined;

    try {
      // Create a form and input using the correct Weavr SDK API
      form = client.form();
      formRef.current = form;
      element = form.input(name, type, parsedOptions);
      elementRef.current = element;
      setError(null);

      // Attach event listeners using refs so callback changes don't recreate the input
      element.on('ready', () => callbacksRef.current.onReady?.());
      element.on('change', (data: SecureInputChangeEvent) => callbacksRef.current.onChange?.(data));
      element.on('focus', () => callbacksRef.current.onFocus?.());
      element.on('blur', () => callbacksRef.current.onBlur?.());
      element.on('keyup', (event: KeyboardEvent) => callbacksRef.current.onKeyUp?.(event));
      if (type === 'password') {
        element.on('strength', (data: SecureInputStrengthEvent) =>
          callbacksRef.current.onStrength?.(data)
        );
      }

      element.mount(containerRef.current);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to create secure input';
      setError(message);
      // Clean up form if element creation failed
      if (form && !element) {
        try {
          form.destroy();
        } catch {
          // Ignore cleanup errors
        }
      }
      return;
    }

    return () => {
      // Destroying the element and form cleans up all listeners
      try {
        if (elementRef.current) {
          elementRef.current.destroy();
        }
        if (formRef.current) {
          formRef.current.destroy();
        }
      } catch {
        // Ignore cleanup errors
      }
      elementRef.current = null;
      formRef.current = null;
    };
    // Only recreate when these stable values change - callbacks are accessed via ref
  }, [client, isInitialized, name, type, optionsKey]);

  if (!isInitialized) {
    return (
      <div className={className} style={containerStyle}>
        Loading...
      </div>
    );
  }

  if (error) {
    return (
      <div className={className} style={{ ...containerStyle, color: '#dc3545', fontSize: 14 }}>
        {error}
      </div>
    );
  }

  return <div ref={containerRef} className={className} style={containerStyle} />;
});

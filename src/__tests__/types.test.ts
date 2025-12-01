import { describe, it, expect } from 'vitest';
import type { SecureInputType, SecureSpanType, SecureElementStyles } from '../types';

// Type-level tests to ensure our types compile correctly
describe('types', () => {
  it('SecureInputType includes expected values', () => {
    const types: SecureInputType[] = [
      'password',
      'confirmPassword',
      'passCode',
      'confirmPassCode',
      'cardPin',
    ];
    expect(types).toHaveLength(5);
  });

  it('SecureSpanType includes expected values', () => {
    const types: SecureSpanType[] = ['cardNumber', 'cvv', 'cardPin'];
    expect(types).toHaveLength(3);
  });

  it('SecureElementStyles has expected structure', () => {
    const styles: SecureElementStyles = {
      base: {
        color: '#000',
        fontSize: '16px',
        ':hover': {
          color: '#333',
        },
        '::placeholder': {
          color: '#999',
        },
      },
      valid: {
        color: 'green',
      },
      invalid: {
        color: 'red',
      },
    };

    expect(styles.base?.color).toBe('#000');
    expect(styles.base?.[':hover']?.color).toBe('#333');
  });
});

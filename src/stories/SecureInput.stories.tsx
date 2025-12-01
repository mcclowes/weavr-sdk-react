import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import { WeavrProvider, SecureInput } from '../index';
import type { SecureInputChangeEvent, SecureInputStrengthEvent } from '../types';
import { weavrConfig } from './config';

// Wrapper to provide Weavr context
function WeavrWrapper({ children }: { children: React.ReactNode }) {
  return (
    <WeavrProvider uiKey={weavrConfig.uiKey} environment={weavrConfig.environment}>
      {children}
    </WeavrProvider>
  );
}

// Demo component showing SecureInput with state
function SecureInputDemo({
  type,
  placeholder,
  showStrength,
}: {
  type: 'password' | 'confirmPassword' | 'passCode' | 'confirmPassCode' | 'cardPin';
  placeholder: string;
  showStrength?: boolean;
}) {
  const [state, setState] = useState({
    empty: true,
    valid: false,
    strength: '',
  });

  const handleChange = (data: SecureInputChangeEvent) => {
    setState((prev) => ({ ...prev, empty: data.empty, valid: data.valid }));
  };

  const handleStrength = (data: SecureInputStrengthEvent) => {
    setState((prev) => ({ ...prev, strength: data.strength }));
  };

  return (
    <div style={{ width: 320, fontFamily: 'system-ui' }}>
      <label style={{ display: 'block', marginBottom: 8, fontWeight: 500 }}>
        {type === 'password'
          ? 'Password'
          : type === 'confirmPassword'
            ? 'Confirm Password'
            : type === 'passCode'
              ? 'Passcode'
              : type === 'confirmPassCode'
                ? 'Confirm Passcode'
                : 'Card PIN'}
      </label>
      <SecureInput
        name={type}
        type={type}
        options={{
          placeholder,
          maxlength: ['cardPin', 'passCode', 'confirmPassCode'].includes(type) ? 6 : 30,
          style: {
            base: {
              fontSize: '16px',
              fontFamily: 'system-ui, sans-serif',
              color: '#333',
            },
            invalid: {
              color: '#dc3545',
            },
          },
        }}
        containerStyle={{
          border: `1px solid ${state.valid ? '#28a745' : state.empty ? '#ccc' : '#dc3545'}`,
          borderRadius: 4,
          padding: 12,
          transition: 'border-color 0.2s',
        }}
        onChange={handleChange}
        onStrength={showStrength ? handleStrength : undefined}
      />
      <div style={{ marginTop: 12, fontSize: 14, color: '#666' }}>
        <div>Empty: {state.empty ? 'Yes' : 'No'}</div>
        <div>Valid: {state.valid ? 'Yes' : 'No'}</div>
        {showStrength && state.strength && (
          <div>
            Strength:{' '}
            <span
              style={{
                color:
                  state.strength === 'strong'
                    ? '#28a745'
                    : state.strength === 'fair'
                      ? '#ffc107'
                      : '#dc3545',
              }}
            >
              {state.strength}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}

const meta: Meta<typeof SecureInput> = {
  title: 'Components/SecureInput',
  component: SecureInput,
  decorators: [
    (Story) => (
      <WeavrWrapper>
        <Story />
      </WeavrWrapper>
    ),
  ],
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: `
SecureInput creates a secure iframe-based input for capturing sensitive data like passwords, passcodes, and card PINs.

The actual input value never touches your JavaScript - it's captured directly by Weavr's secure iframe and tokenized.

**Input types:**
- \`password\`: For password capture with strength indicator
- \`confirmPassword\`: For password confirmation (validates match)
- \`passcode\`: For numeric passcodes
- \`confirmPasscode\`: For passcode confirmation (validates match)
- \`cardPin\`: For 4-6 digit card PINs
        `,
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    type: {
      control: 'select',
      options: ['password', 'confirmPassword', 'passCode', 'confirmPassCode', 'cardPin'],
      description: 'Type of secure input',
      table: {
        type: { summary: 'password | confirmPassword | passCode | confirmPassCode | cardPin' },
        defaultValue: { summary: 'password' },
      },
    },
    name: {
      control: 'text',
      description: 'Unique name for the input (used for tokenization)',
    },
    className: {
      control: 'text',
      description: 'CSS class name for the container',
    },
    options: {
      control: 'object',
      description: 'Input options including placeholder, maxlength, and styles',
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Password: Story = {
  render: () => <SecureInputDemo type="password" placeholder="Enter password" showStrength />,
};

export const ConfirmPassword: Story = {
  render: () => <SecureInputDemo type="confirmPassword" placeholder="Confirm password" />,
};

export const PassCode: Story = {
  render: () => <SecureInputDemo type="passCode" placeholder="Enter passcode" />,
};

export const ConfirmPassCode: Story = {
  render: () => <SecureInputDemo type="confirmPassCode" placeholder="Confirm passcode" />,
};

export const CardPIN: Story = {
  render: () => <SecureInputDemo type="cardPin" placeholder="Enter PIN" />,
};

// Note: Passcode and CardPIN require specific SDK configurations:
// - Passcode may not be supported in all environments
// - CardPIN requires stepped-up authentication (OpcUxSecureClient.associate())

// Interactive playground with controls
export const Playground: Story = {
  args: {
    name: 'password',
    type: 'password',
    options: {
      placeholder: 'Enter password',
      maxlength: 30,
    },
  },
  argTypes: {
    'options.placeholder': {
      control: 'text',
      name: 'Placeholder',
    },
    'options.maxlength': {
      control: { type: 'number', min: 1, max: 100 },
      name: 'Max Length',
    },
  },
  render: (args) => (
    <div style={{ width: 300 }}>
      <SecureInput
        name={args.name}
        type={args.type}
        options={args.options}
        className={args.className}
        containerStyle={{
          border: '1px solid #ccc',
          borderRadius: 4,
          padding: 12,
        }}
      />
      <p style={{ marginTop: 8, fontSize: 12, color: '#666' }}>
        Use the Controls panel to modify the input properties.
      </p>
    </div>
  ),
};

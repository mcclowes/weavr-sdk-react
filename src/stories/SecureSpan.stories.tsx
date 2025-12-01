import type { Meta, StoryObj } from '@storybook/react'
import { useState } from 'react'
import { WeavrProvider, SecureSpan, useAssociate } from '../index'
import { weavrConfig } from './config'

// Wrapper to provide Weavr context
function WeavrWrapper({ children }: { children: React.ReactNode }) {
  return (
    <WeavrProvider uiKey={weavrConfig.uiKey} environment={weavrConfig.environment}>
      {children}
    </WeavrProvider>
  )
}

// Demo component showing card details display
function CardDisplayDemo() {
  const { associate, isAssociating, isAssociated, error } = useAssociate()
  const [showDetails, setShowDetails] = useState(false)

  const handleAssociate = async () => {
    try {
      // In a real app, this would be your user's auth token
      await associate('Bearer user-auth-token')
      setShowDetails(true)
    } catch (e) {
      console.error('Association failed:', e)
    }
  }

  return (
    <div style={{ width: 350, fontFamily: 'system-ui' }}>
      <div
        style={{
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          borderRadius: 12,
          padding: 24,
          color: 'white',
        }}
      >
        <div style={{ fontSize: 12, opacity: 0.8, marginBottom: 20 }}>VIRTUAL CARD</div>

        <div style={{ marginBottom: 20 }}>
          <div style={{ fontSize: 11, opacity: 0.7, marginBottom: 4 }}>Card Number</div>
          {showDetails ? (
            <SecureSpan
              type="cardNumber"
              token="card-token-placeholder"
              weavrStyle={{
                base: {
                  fontSize: '18px',
                  fontFamily: 'monospace',
                  color: 'white',
                  letterSpacing: '2px',
                },
              }}
              containerStyle={{ minHeight: 24 }}
            />
          ) : (
            <div style={{ fontSize: 18, fontFamily: 'monospace', letterSpacing: 2 }}>
              •••• •••• •••• ••••
            </div>
          )}
        </div>

        <div style={{ display: 'flex', gap: 40 }}>
          <div>
            <div style={{ fontSize: 11, opacity: 0.7, marginBottom: 4 }}>CVV</div>
            {showDetails ? (
              <SecureSpan
                type="cvv"
                token="cvv-token-placeholder"
                weavrStyle={{
                  base: {
                    fontSize: '16px',
                    fontFamily: 'monospace',
                    color: 'white',
                  },
                }}
                containerStyle={{ minHeight: 20 }}
              />
            ) : (
              <div style={{ fontSize: 16, fontFamily: 'monospace' }}>•••</div>
            )}
          </div>
          <div>
            <div style={{ fontSize: 11, opacity: 0.7, marginBottom: 4 }}>Expires</div>
            <div style={{ fontSize: 16 }}>12/25</div>
          </div>
        </div>
      </div>

      <div style={{ marginTop: 16, textAlign: 'center' }}>
        {!isAssociated ? (
          <button
            onClick={handleAssociate}
            disabled={isAssociating}
            style={{
              padding: '12px 24px',
              background: '#667eea',
              color: 'white',
              border: 'none',
              borderRadius: 6,
              cursor: isAssociating ? 'wait' : 'pointer',
              fontSize: 14,
            }}
          >
            {isAssociating ? 'Authenticating...' : 'Show Card Details'}
          </button>
        ) : (
          <button
            onClick={() => setShowDetails(!showDetails)}
            style={{
              padding: '12px 24px',
              background: showDetails ? '#6c757d' : '#667eea',
              color: 'white',
              border: 'none',
              borderRadius: 6,
              cursor: 'pointer',
              fontSize: 14,
            }}
          >
            {showDetails ? 'Hide Details' : 'Show Details'}
          </button>
        )}
        {error && (
          <div style={{ color: '#dc3545', marginTop: 8, fontSize: 14 }}>{error.message}</div>
        )}
      </div>

      <p style={{ marginTop: 16, fontSize: 12, color: '#666', textAlign: 'center' }}>
        Note: Requires valid auth token and card tokens from your Weavr API.
        <br />
        In sandbox, association will fail with placeholder tokens.
      </p>
    </div>
  )
}

const meta: Meta<typeof SecureSpan> = {
  title: 'Components/SecureSpan',
  component: SecureSpan,
  decorators: [(Story) => <WeavrWrapper><Story /></WeavrWrapper>],
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: `
SecureSpan displays sensitive card data (card number, CVV, PIN) in a secure iframe.

**Important:** Before displaying card data, you must call \`associate()\` with the user's authentication token.

**Display types:**
- \`cardNumber\`: 16-digit card number
- \`cvv\`: 3-digit CVV
- \`cardPin\`: 4-digit PIN
        `,
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    type: {
      control: 'select',
      options: ['cardNumber', 'cvv', 'cardPin'],
      description: 'Type of secure data to display',
      table: {
        type: { summary: 'cardNumber | cvv | cardPin' },
      },
    },
    token: {
      control: 'text',
      description: 'Secure token for the card data',
    },
    className: {
      control: 'text',
      description: 'CSS class for the container',
    },
    weavrStyle: {
      control: 'object',
      description: 'Weavr styling options for the secure element',
    },
    onReady: { action: 'ready' },
    onChange: { action: 'change' },
  },
}

export default meta
type Story = StoryObj<typeof meta>

export const CardDetails: Story = {
  render: () => <CardDisplayDemo />,
}

export const CardNumber: Story = {
  args: {
    type: 'cardNumber',
    token: 'card-number-token',
  },
  render: (args) => (
    <div style={{ padding: 16, background: '#f5f5f5', borderRadius: 8 }}>
      <div style={{ fontSize: 12, color: '#666', marginBottom: 8 }}>Card Number</div>
      <SecureSpan
        type={args.type!}
        token={args.token!}
        weavrStyle={{
          base: {
            fontSize: '18px',
            fontFamily: 'monospace',
            letterSpacing: '2px',
          },
        }}
        containerStyle={{ minHeight: 24 }}
      />
    </div>
  ),
}

export const CVV: Story = {
  args: {
    type: 'cvv',
    token: 'cvv-token',
  },
  render: (args) => (
    <div style={{ padding: 16, background: '#f5f5f5', borderRadius: 8 }}>
      <div style={{ fontSize: 12, color: '#666', marginBottom: 8 }}>CVV</div>
      <SecureSpan
        type={args.type!}
        token={args.token!}
        weavrStyle={{
          base: {
            fontSize: '16px',
            fontFamily: 'monospace',
          },
        }}
        containerStyle={{ minHeight: 20 }}
      />
    </div>
  ),
}

export const Playground: Story = {
  args: {
    type: 'cardNumber',
    token: 'your-card-token',
    weavrStyle: {
      base: {
        fontSize: '18px',
        fontFamily: 'monospace',
        color: '#333',
        letterSpacing: '2px',
      },
    },
  },
  render: (args) => (
    <div style={{ padding: 24, background: '#f5f5f5', borderRadius: 8, minWidth: 300 }}>
      <div style={{ fontSize: 12, color: '#666', marginBottom: 8 }}>
        {args.type === 'cardNumber' ? 'Card Number' : args.type === 'cvv' ? 'CVV' : 'Card PIN'}
      </div>
      <SecureSpan
        type={args.type!}
        token={args.token!}
        weavrStyle={args.weavrStyle}
        className={args.className}
        containerStyle={{ minHeight: 24 }}
        onReady={args.onReady}
        onChange={args.onChange}
      />
      <p style={{ marginTop: 16, fontSize: 12, color: '#666' }}>
        Use the Controls panel to modify type, token, and styling.
        Requires user association and valid card tokens.
      </p>
    </div>
  ),
}

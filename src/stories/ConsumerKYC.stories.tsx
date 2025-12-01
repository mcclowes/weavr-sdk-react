import type { Meta, StoryObj } from '@storybook/react'
import { useState } from 'react'
import { WeavrProvider, ConsumerKYC } from '../index'
import type { ConsumerKYCMessage } from '../types'
import { weavrConfig } from './config'

// Wrapper to provide Weavr context
function WeavrWrapper({ children }: { children: React.ReactNode }) {
  return (
    <WeavrProvider uiKey={weavrConfig.uiKey} environment={weavrConfig.environment}>
      {children}
    </WeavrProvider>
  )
}

function ConsumerKYCDemo() {
  const [status, setStatus] = useState<string>('Not started')
  const [events, setEvents] = useState<string[]>([])

  const addEvent = (event: string) => {
    setEvents((prev) => [...prev, `${new Date().toLocaleTimeString()}: ${event}`])
  }

  return (
    <div style={{ width: 500, fontFamily: 'system-ui' }}>
      <div style={{ marginBottom: 16 }}>
        <h3 style={{ margin: 0, marginBottom: 8 }}>Consumer KYC Verification</h3>
        <p style={{ margin: 0, color: '#666', fontSize: 14 }}>
          Identity verification for consumer users (requires authentication)
        </p>
      </div>

      <div
        style={{
          border: '1px solid #e0e0e0',
          borderRadius: 8,
          minHeight: 400,
          background: '#fafafa',
        }}
      >
        <ConsumerKYC
          reference="kyc-reference-from-api"
          accessToken="user-access-token"
          lang="en"
          onMessage={(message: ConsumerKYCMessage) => {
            if (message.type === 'kycSubmitted') {
              setStatus('Submitted')
            }
            addEvent(`Message: ${message.type}`)
          }}
          onError={(error) => {
            setStatus('Error')
            addEvent(`Error: ${error.message}`)
          }}
        />
      </div>

      <div style={{ marginTop: 16 }}>
        <div style={{ fontSize: 14, fontWeight: 500, marginBottom: 8 }}>
          Status: <span style={{ color: status === 'Submitted' ? '#28a745' : '#666' }}>{status}</span>
        </div>
        {events.length > 0 && (
          <div>
            <div style={{ fontSize: 12, fontWeight: 500, marginBottom: 4 }}>Events:</div>
            <div
              style={{
                background: '#f5f5f5',
                borderRadius: 4,
                padding: 12,
                fontSize: 12,
                fontFamily: 'monospace',
                maxHeight: 150,
                overflow: 'auto',
              }}
            >
              {events.map((event, i) => (
                <div key={i}>{event}</div>
              ))}
            </div>
          </div>
        )}
      </div>

      <p style={{ marginTop: 16, fontSize: 12, color: '#666' }}>
        Note: Consumer KYC requires a valid access token and KYC reference from your Weavr API.
        Unlike Director KYC, the user must be authenticated first.
      </p>
    </div>
  )
}

const meta: Meta<typeof ConsumerKYC> = {
  title: 'Components/ConsumerKYC',
  component: ConsumerKYC,
  decorators: [(Story) => <WeavrWrapper><Story /></WeavrWrapper>],
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: `
Consumer KYC component for identity verification of authenticated consumer users.

**Important:** Unlike Director KYC, Consumer KYC requires the user to be authenticated first via \`associate()\`.

**Props:**
- \`reference\`: KYC reference from the API
- \`accessToken\`: User's authentication token
- \`lang\`: Language code (ISO 639-1)
- \`customCss\`: URL to custom CSS file
- \`customCssStr\`: Inline CSS string

**Events:**
- \`onMessage\`: Called when KYC status changes (e.g., kycSubmitted)
- \`onError\`: Called on error
        `,
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    reference: {
      control: 'text',
      description: 'KYC reference from the Weavr API',
    },
    accessToken: {
      control: 'text',
      description: 'User access token for authentication',
    },
    lang: {
      control: 'select',
      options: ['en', 'de', 'fr', 'es', 'it', 'nl', 'pt'],
      description: 'Language code (ISO 639-1)',
    },
    className: {
      control: 'text',
      description: 'CSS class for the container',
    },
    onMessage: { action: 'message' },
    onError: { action: 'error' },
  },
}

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: () => <ConsumerKYCDemo />,
}

export const Playground: Story = {
  args: {
    reference: 'your-kyc-reference',
    accessToken: 'your-access-token',
    lang: 'en',
  },
  render: (args) => (
    <div style={{ width: 500, minHeight: 400 }}>
      <ConsumerKYC
        reference={args.reference}
        accessToken={args.accessToken}
        lang={args.lang}
        className={args.className}
        style={{ border: '1px solid #e0e0e0', borderRadius: 8, minHeight: 400 }}
        onMessage={args.onMessage}
        onError={args.onError}
      />
      <p style={{ marginTop: 16, fontSize: 12, color: '#666' }}>
        Use the Controls panel to modify the props. Requires valid credentials from your Weavr API.
      </p>
    </div>
  ),
}

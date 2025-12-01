import type { Meta, StoryObj } from '@storybook/react'
import { useState } from 'react'
import { WeavrProvider, KYC } from '../index'
import { weavrConfig } from './config'

// Wrapper to provide Weavr context
function WeavrWrapper({ children }: { children: React.ReactNode }) {
  return (
    <WeavrProvider uiKey={weavrConfig.uiKey} environment={weavrConfig.environment}>
      {children}
    </WeavrProvider>
  )
}

function KYCDemo() {
  const [status, setStatus] = useState<string>('Not started')
  const [events, setEvents] = useState<string[]>([])

  const addEvent = (event: string) => {
    setEvents((prev) => [...prev, `${new Date().toLocaleTimeString()}: ${event}`])
  }

  return (
    <div style={{ width: 500, fontFamily: 'system-ui' }}>
      <div style={{ marginBottom: 16 }}>
        <h3 style={{ margin: 0, marginBottom: 8 }}>Director KYC Verification</h3>
        <p style={{ margin: 0, color: '#666', fontSize: 14 }}>
          Identity verification for corporate directors and representatives
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
        <KYC
          auth={{
            accessToken: 'user-access-token',
            externalUserId: 'user-123',
          }}
          config={{ hideSteps: false }}
          onComplete={(payload) => {
            setStatus('Completed')
            addEvent(`KYC completed: ${JSON.stringify(payload)}`)
          }}
          onClose={(payload) => {
            setStatus('Closed')
            addEvent(`KYC closed: ${JSON.stringify(payload)}`)
          }}
          onError={(payload) => {
            setStatus('Error')
            addEvent(`KYC error: ${JSON.stringify(payload)}`)
          }}
          onStepChange={(payload) => {
            addEvent(`Step changed: ${JSON.stringify(payload)}`)
          }}
        />
      </div>

      <div style={{ marginTop: 16 }}>
        <div style={{ fontSize: 14, fontWeight: 500, marginBottom: 8 }}>
          Status: <span style={{ color: status === 'Completed' ? '#28a745' : '#666' }}>{status}</span>
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
        Note: The KYC flow requires valid authentication tokens from your Weavr API.
      </p>
    </div>
  )
}

const meta: Meta<typeof KYC> = {
  title: 'Components/KYC (Director)',
  component: KYC,
  decorators: [(Story) => <WeavrWrapper><Story /></WeavrWrapper>],
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: `
**Director KYC** component for identity verification of corporate directors and representatives.

Directors receive emails with links containing a reference parameter. Unlike Consumer KYC, Director KYC does not require the director to be pre-authenticated.

For consumer identity verification, use the \`ConsumerKYC\` component instead.

**Auth object properties:**
- \`accessToken\`: Director's authentication token
- \`externalUserId\`: Your internal user ID
- \`reference\`: Reference from the email URL (required)

**Events:**
- \`onComplete\`: Verification completed successfully
- \`onClose\`: User closed the flow
- \`onError\`: An error occurred
- \`onStepChange\`: User moved to a different step
        `,
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    auth: {
      description: 'Authentication object with access token',
      control: 'object',
    },
    config: {
      description: 'KYC configuration options',
      control: 'object',
    },
    className: {
      control: 'text',
      description: 'CSS class for the container',
    },
    onComplete: { action: 'complete' },
    onClose: { action: 'close' },
    onError: { action: 'error' },
    onStepChange: { action: 'stepChange' },
  },
}

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: () => <KYCDemo />,
}

export const Playground: Story = {
  args: {
    auth: {
      accessToken: 'your-access-token',
      externalUserId: 'user-123',
    },
    config: {
      hideSteps: false,
      lang: 'en',
    },
  },
  render: (args) => (
    <div style={{ width: 500, minHeight: 400 }}>
      <KYC
        auth={args.auth}
        config={args.config}
        className={args.className}
        style={{ border: '1px solid #e0e0e0', borderRadius: 8, minHeight: 400 }}
        onComplete={args.onComplete}
        onClose={args.onClose}
        onError={args.onError}
        onStepChange={args.onStepChange}
      />
      <p style={{ marginTop: 16, fontSize: 12, color: '#666' }}>
        Use the Controls panel to modify auth and config. Requires a valid access token.
      </p>
    </div>
  ),
}

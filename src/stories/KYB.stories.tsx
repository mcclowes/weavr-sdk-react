import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import { WeavrProvider, KYB } from '../index';
import { weavrConfig } from './config';

// Wrapper to provide Weavr context
function WeavrWrapper({ children }: { children: React.ReactNode }) {
  return (
    <WeavrProvider uiKey={weavrConfig.uiKey} environment={weavrConfig.environment}>
      {children}
    </WeavrProvider>
  );
}

function KYBDemo() {
  const [status, setStatus] = useState<string>('Not started');
  const [events, setEvents] = useState<string[]>([]);

  const addEvent = (event: string) => {
    setEvents((prev) => [...prev, `${new Date().toLocaleTimeString()}: ${event}`]);
  };

  return (
    <div style={{ width: 500, fontFamily: 'system-ui' }}>
      <div style={{ marginBottom: 16 }}>
        <h3 style={{ margin: 0, marginBottom: 8 }}>KYB Verification</h3>
        <p style={{ margin: 0, color: '#666', fontSize: 14 }}>
          Know Your Business verification for corporate customers
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
        <KYB
          auth={{
            accessToken: 'corporate-access-token',
            externalUserId: 'company-123',
          }}
          config={{ hideSteps: false }}
          onManualVerify={
            weavrConfig.corporateId && weavrConfig.programmeKey
              ? async () => {
                  // In real usage, call your backend API route that makes this request
                  const res = await fetch('/api/simulate-kyb', {
                    method: 'POST',
                    body: JSON.stringify({ corporateId: weavrConfig.corporateId }),
                  });
                  if (!res.ok) throw new Error('Verification failed');
                }
              : undefined
          }
          onComplete={(payload) => {
            setStatus('Completed');
            addEvent(`KYB completed: ${JSON.stringify(payload)}`);
          }}
          onClose={(payload) => {
            setStatus('Closed');
            addEvent(`KYB closed: ${JSON.stringify(payload)}`);
          }}
          onError={(payload) => {
            setStatus('Error');
            addEvent(`KYB error: ${JSON.stringify(payload)}`);
          }}
          onStepChange={(payload) => {
            addEvent(`Step changed: ${JSON.stringify(payload)}`);
          }}
        />
      </div>

      <div style={{ marginTop: 16 }}>
        <div style={{ fontSize: 14, fontWeight: 500, marginBottom: 8 }}>
          Status:{' '}
          <span style={{ color: status === 'Completed' ? '#28a745' : '#666' }}>{status}</span>
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
        Note: The KYB flow requires valid authentication tokens from your Weavr API.
      </p>
    </div>
  );
}

const meta: Meta<typeof KYB> = {
  title: 'Components/KYB',
  component: KYB,
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
KYB (Know Your Business) component for corporate customer due diligence.

**Auth object properties:**
- \`accessToken\`: Corporate user's authentication token
- \`externalUserId\`: Your internal company/user ID
- \`reference\`: Optional reference string

**Manual verification (sandbox only):**
- \`onManualVerify\`: Async function to call your backend's verification endpoint

When provided in sandbox mode, a "Verify Manually" button appears. Your backend should call:
\`\`\`
POST https://sandbox.weavr.io/simulate/api/corporates/{corporateId}/verify
Headers: programme-key: {your-key}, Content-Type: application/json
\`\`\`

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
      description: 'KYB configuration options',
      control: 'object',
    },
    className: {
      control: 'text',
      description: 'CSS class for the container',
    },
    onManualVerify: {
      description: 'Async handler for manual verification via your backend (sandbox only)',
    },
    onComplete: { action: 'complete' },
    onClose: { action: 'close' },
    onError: { action: 'error' },
    onStepChange: { action: 'stepChange' },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => <KYBDemo />,
};

export const Playground: Story = {
  args: {
    auth: {
      accessToken: 'your-access-token',
      externalUserId: 'company-123',
    },
    config: {
      hideSteps: false,
      lang: 'en',
    },
  },
  render: (args) => (
    <div style={{ width: 500, minHeight: 400 }}>
      <KYB
        auth={args.auth}
        config={args.config}
        className={args.className}
        style={{ border: '1px solid #e0e0e0', borderRadius: 8, minHeight: 400 }}
        onManualVerify={args.onManualVerify}
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
};

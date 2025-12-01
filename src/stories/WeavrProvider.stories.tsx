import type { Meta, StoryObj } from '@storybook/react'
import { WeavrProvider, useWeavr } from '../index'
import { weavrConfig } from './config'

function WeavrStatus() {
  const { isLoading, isInitialized, error } = useWeavr()

  return (
    <div style={{ padding: 20, fontFamily: 'system-ui' }}>
      <h3>Weavr Provider Status</h3>
      <ul>
        <li>Loading: {isLoading ? 'Yes' : 'No'}</li>
        <li>Initialized: {isInitialized ? 'Yes' : 'No'}</li>
        <li>Error: {error ? error.message : 'None'}</li>
      </ul>
    </div>
  )
}

const meta: Meta<typeof WeavrProvider> = {
  title: 'Core/WeavrProvider',
  component: WeavrProvider,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: `
The WeavrProvider initializes the Weavr secure client and makes it available to all child components.

**Required props:**
- \`uiKey\`: Your Weavr UI key from the portal

**Optional props:**
- \`environment\`: 'sandbox' (default) or 'production'
- \`fonts\`: Array of font sources to load
        `,
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    uiKey: {
      control: 'text',
      description: 'Your Weavr UI key',
    },
    environment: {
      control: 'select',
      options: ['sandbox', 'production'],
      description: 'Weavr environment',
    },
  },
}

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    uiKey: weavrConfig.uiKey,
    environment: weavrConfig.environment,
  },
  render: (args) => (
    <WeavrProvider uiKey={args.uiKey!} environment={args.environment}>
      <WeavrStatus />
    </WeavrProvider>
  ),
}

export const WithFonts: Story = {
  args: {
    uiKey: weavrConfig.uiKey,
    environment: weavrConfig.environment,
    fonts: [{ cssSrc: 'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&display=swap' }],
  },
  render: (args) => (
    <WeavrProvider uiKey={args.uiKey!} environment={args.environment} fonts={args.fonts}>
      <WeavrStatus />
    </WeavrProvider>
  ),
}

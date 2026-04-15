# weavr-sdk-react

React wrapper for Weavr's secure UI components for payments, identity verification, and sensitive data handling.

## Installation

```bash
npm install weavr-sdk-react
# or
yarn add weavr-sdk-react
```

**Peer Dependencies:** React >= 17.0.0, React DOM >= 17.0.0

## Quick Start

```tsx
import { WeavrProvider, SecureInput, useSecureForm } from 'weavr-sdk-react'

function App() {
  return (
    <WeavrProvider uiKey="your-ui-key" environment="sandbox">
      <PasswordForm />
    </WeavrProvider>
  )
}

function PasswordForm() {
  const { tokenize, isReady } = useSecureForm()

  const handleSubmit = async () => {
    const tokens = await tokenize()
    // Send tokens to your server
  }

  return (
    <form onSubmit={handleSubmit}>
      <SecureInput name="password" type="password" />
      <button disabled={!isReady}>Submit</button>
    </form>
  )
}
```

## Core Concepts

### Secure Iframes

All sensitive data (passwords, PINs, card numbers) is captured in secure iframes. Your application JavaScript never has access to raw values—only tokenized representations that can be sent to Weavr's API.

### Authentication Flow

Some operations require user association (stepped-up authentication):

1. User logs in via your backend
2. Backend returns an access token
3. Call `associate()` or use `useAssociatedClient()` to link the token
4. SecureSpan and KYC/KYB components now work

---

## Provider

### WeavrProvider

Wrap your app to initialize the Weavr client:

```tsx
<WeavrProvider
  uiKey="your-ui-key"
  environment="sandbox" // or "production"
  fonts={[{ src: 'url(https://...)', fontFamily: 'CustomFont' }]}
>
  {children}
</WeavrProvider>
```

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `uiKey` | `string` | Yes | Your Weavr UI key |
| `environment` | `'sandbox' \| 'production'` | No | Defaults to `'production'` |
| `fonts` | `FontSource[]` | No | Custom fonts for secure elements |
| `customScriptUrl` | `string` | No | Override the Weavr script URL |

Access provider state with `useWeavr()`:

```tsx
const { client, isLoading, error, isInitialized } = useWeavr()
```

---

## Components

### SecureInput

Capture sensitive data securely via iframe.

```tsx
import { SecureInput } from 'weavr-sdk-react'

<SecureInput
  name="password"
  type="password"
  placeholder="Enter password"
  showStrength={true}
  onReady={() => console.log('Input ready')}
  onChange={(e) => console.log('Has value:', e.hasValue)}
  onStrength={(e) => console.log('Strength:', e.strength)}
/>
```

| Prop | Type | Description |
|------|------|-------------|
| `name` | `string` | Form field name (required) |
| `type` | `'password' \| 'confirmPassword' \| 'passCode' \| 'confirmPassCode' \| 'cardPin'` | Input type (required) |
| `placeholder` | `string` | Placeholder text |
| `showStrength` | `boolean` | Show password strength indicator |
| `style` | `SecureElementStyle` | Weavr style object (see Styling) |
| `className` | `string` | CSS class for container |
| `containerStyle` | `CSSProperties` | Inline styles for container |

**Events:**

| Event | Payload | Description |
|-------|---------|-------------|
| `onReady` | `void` | Element is ready for interaction |
| `onChange` | `{ empty, hasValue }` | Value changed |
| `onFocus` | `void` | Input focused |
| `onBlur` | `void` | Input blurred |
| `onKeyUp` | `KeyboardEvent` | Key released |
| `onStrength` | `{ strength: 0-4 }` | Password strength updated |

**Ref Methods:**

```tsx
const inputRef = useRef<SecureInputRef>(null)

inputRef.current?.focus()
inputRef.current?.blur()
inputRef.current?.clear()
const token = await inputRef.current?.tokenize()
```

---

### SecureSpan

Display sensitive card data securely. **Requires user association first.**

```tsx
import { SecureSpan, useAssociate } from 'weavr-sdk-react'

function CardDisplay({ cardToken }: { cardToken: string }) {
  const { associate, isAssociated } = useAssociate()

  useEffect(() => {
    associate('Bearer user-access-token')
  }, [])

  if (!isAssociated) return <div>Loading...</div>

  return (
    <div>
      <SecureSpan type="cardNumber" token={cardToken} />
      <SecureSpan type="cvv" token={cardToken} />
    </div>
  )
}
```

| Prop | Type | Description |
|------|------|-------------|
| `type` | `'cardNumber' \| 'cvv' \| 'cardPin'` | Data type to display (required) |
| `token` | `string` | Card token from Weavr API (required) |
| `style` | `SecureElementStyle` | Weavr style object |
| `className` | `string` | CSS class for container |

---

### KYB (Know Your Business)

Corporate identity verification flow.

```tsx
import { KYB } from 'weavr-sdk-react'

<KYB
  auth={{ accessToken: 'Bearer token' }}
  options={{
    customCss: 'https://example.com/kyb-styles.css',
    language: 'en',
  }}
  onComplete={() => console.log('KYB complete')}
  onClose={() => console.log('User closed')}
  onError={(error) => console.error(error)}
  onStepChange={(step) => console.log('Step:', step)}
/>
```

| Prop | Type | Description |
|------|------|-------------|
| `auth` | `{ accessToken: string }` | Authentication object (required) |
| `options` | `KYBConfig` | Configuration options |
| `onComplete` | `() => void` | Verification completed |
| `onClose` | `() => void` | User closed the flow |
| `onError` | `(error: Error) => void` | Error occurred |
| `onStepChange` | `(step: string) => void` | Flow step changed |

**Sandbox Testing:**

In sandbox mode, a "Verify Manually" button appears for testing without real documents.

---

### KYC (Know Your Customer)

Individual identity verification flow.

```tsx
import { KYC } from 'weavr-sdk-react'

<KYC
  auth={{ accessToken: 'Bearer token' }}
  options={{
    customCss: 'https://example.com/kyc-styles.css',
    language: 'en',
  }}
  onComplete={() => console.log('KYC complete')}
  onClose={() => console.log('User closed')}
  onError={(error) => console.error(error)}
/>
```

Same props as KYB.

---

### ConsumerKYC

Simplified KYC for consumer applications.

```tsx
import { ConsumerKYC } from 'weavr-sdk-react'

<ConsumerKYC
  reference="unique-reference-id"
  accessToken="Bearer token"
  lang="en"
  customCss="https://example.com/kyc-styles.css"
  onMessage={(msg) => {
    if (msg.type === 'kycApproved') {
      // Handle approval
    }
  }}
/>
```

| Message Types | Description |
|---------------|-------------|
| `kycSubmitted` | Documents submitted for review |
| `kycApproved` | Verification approved |
| `kycRejected` | Verification rejected |

---

## Hooks

### useSecureForm

Create and manage multiple secure inputs as a form.

```tsx
import { useSecureForm } from 'weavr-sdk-react'

function PaymentForm() {
  const { form, createInput, tokenize, destroy, isReady } = useSecureForm()

  useEffect(() => {
    // Programmatically create inputs
    createInput('cardPin', 'cardPin', { placeholder: 'PIN' })

    return () => destroy()
  }, [])

  const handleSubmit = async () => {
    const tokens = await tokenize()
    // tokens = { password: 'tok_...', cardPin: 'tok_...' }
  }

  return (
    <form onSubmit={handleSubmit}>
      <SecureInput name="password" type="password" />
      <div id="cardPin" /> {/* createInput mounts here */}
      <button disabled={!isReady}>Pay</button>
    </form>
  )
}
```

---

### useAssociate

Manually associate user tokens for stepped-up authentication.

```tsx
import { useAssociate } from 'weavr-sdk-react'

const { associate, isAssociating, isAssociated, error } = useAssociate()

// After user login
await associate('Bearer user-access-token')
```

---

### useSetUserToken

Alternative to `useAssociate` for setting tokens.

```tsx
import { useSetUserToken } from 'weavr-sdk-react'

const { setToken, isSettingToken, isTokenSet, error } = useSetUserToken()

await setToken('user-access-token') // Bearer prefix added automatically
```

---

### useAssociatedClient

Combines client access with automatic token association. Used internally by KYC/KYB components.

```tsx
import { useAssociatedClient } from 'weavr-sdk-react'

const { client, isAssociated, isAssociating, error } = useAssociatedClient(accessToken)
```

---

## Styling

Secure elements accept a `style` prop using Weavr's styling API:

```tsx
<SecureInput
  name="password"
  type="password"
  style={{
    base: {
      color: '#333',
      fontSize: '16px',
      fontFamily: 'Inter, sans-serif',
      '::placeholder': {
        color: '#999',
      },
    },
    empty: {
      color: '#ccc',
    },
    valid: {
      color: '#0a0',
    },
    invalid: {
      color: '#f00',
    },
  }}
/>
```

**Available Style States:**

| State | Description |
|-------|-------------|
| `base` | Default styles |
| `empty` | When input is empty |
| `valid` | When validation passes |
| `invalid` | When validation fails |

**Supported Pseudo-classes:**

- `:hover`
- `:focus`
- `::placeholder`
- `::selection`
- `:-webkit-autofill`

---

## Theming

Apply consistent styling across all secure elements via `WeavrThemeProvider`:

```tsx
import { WeavrThemeProvider, lightTheme, darkTheme, createTheme } from 'weavr-sdk-react'

<WeavrProvider uiKey="your-ui-key">
  <WeavrThemeProvider theme={darkTheme}>
    <App />
  </WeavrThemeProvider>
</WeavrProvider>
```

Themes expose `colors`, `typography`, `spacing`, `borders`, and `shadows`. Use `createTheme(overrides)` to extend a base theme, or the `useThemedInputStyles` / `useThemedSpanStyles` / `useThemedKycCss` hooks to read derived styles inside custom components.

---

## Standalone Client Functions

For advanced use cases outside React components:

```tsx
import {
  initWeavr,
  getWeavrClient,
  associateUserToken,
  loadWeavrClient
} from 'weavr-sdk-react'

// Initialize manually (usually done by WeavrProvider)
await initWeavr({ uiKey: 'your-key', environment: 'sandbox' })

// Get the client instance
const client = getWeavrClient()

// Associate a user token
await associateUserToken('Bearer token')
```

---

## TypeScript

Full TypeScript support with exported types:

```tsx
import type {
  SecureInputType,
  SecureSpanType,
  SecureElementStyle,
  SecureInputChangeEvent,
  SecureInputStrengthEvent,
  KYBConfig,
  KYCConfig,
} from 'weavr-sdk-react'
```

---

## Development

```bash
# Install dependencies
npm install

# Run Storybook for component development
npm run storybook

# Run tests
npm run test

# Type check
npm run typecheck

# Build
npm run build
```

### Environment Variables

For Storybook, create `.env.local`:

```
STORYBOOK_WEAVR_UI_KEY=your-sandbox-ui-key
```

---

## Browser Support

Supports all modern browsers. The SDK loads Weavr's secure client script from:

- **Sandbox:** `https://sandbox.weavr.io/app/secure/static/client.1.js`
- **Production:** `https://secure.weavr.io/app/secure/static/client.1.js`

---

## License

MIT

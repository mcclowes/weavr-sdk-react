---
name: weavr-components
description: Build payment and banking features using Weavr's Secure UI components and API. Covers tokenized input, card display, KYC/KYB verification flows, and end-to-end integration patterns. Use when implementing Weavr UI into a web application.
curated: true
version: 1.0.0
---

# Weavr Component Integration Guide

Build payment and banking features using Weavr's API and Secure UI components. Sensitive data (passwords, PINs, card numbers) is always tokenized client-side and never touches your servers.

## Architecture

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│   Your App UI   │────▶│  Weavr Secure   │────▶│   Weavr API     │
│                 │     │  UI Components  │     │                 │
└─────────────────┘     └─────────────────┘     └─────────────────┘
        │                       │                       │
        │                       ▼                       │
        │               Tokenized Data                  │
        │               (never raw PII)                 │
        │                       │                       │
        └───────────────────────┴───────────────────────┘
                        Your Backend
```

## Quick start

### 1. Load the Secure UI SDK

```html
<!-- Sandbox -->
<script src="https://sandbox.weavr.io/app/secure/static/client.1.js"></script>

<!-- Production -->
<script src="https://api.weavr.io/app/secure/static/client.1.js"></script>
```

### 2. Initialize

```javascript
window.OpcUxSecureClient.init('{{ui_key}}');
```

### 3. Collect a password (tokenized)

```javascript
const form = window.OpcUxSecureClient.form();
const passwordInput = form.input('p', 'password', { placeholder: 'Create password' });
const confirmInput = form.input('cp', 'confirmPassword', { placeholder: 'Confirm password' });

passwordInput.mount(document.getElementById('password-container'));
confirmInput.mount(document.getElementById('confirm-container'));

form.tokenize(function(tokens) {
  // tokens.password is a secure token — send to your server
  // Your server calls POST /multi/passwords with the token
});
```

## Component types

### Input components (collect sensitive data)

| Component | Field name | Purpose |
|-----------|-----------|---------|
| `password` | `p` | Authentication password |
| `confirmPassword` | `cp` | Password confirmation |
| `passCode` | `pc` | PIN-based authentication |
| `confirmPassCode` | `cpc` | PIN confirmation |
| `cardPin` | `pin` | Physical card PIN capture |

### Display components (show sensitive data)

Require step-up authentication before display.

| Component | Purpose |
|-----------|---------|
| `cardNumber` | Full card number |
| `cvv` | Card security code |
| `pin` | Existing PIN display |

### Verification components

| Component | Purpose |
|-----------|---------|
| `consumer_kyc()` | Consumer identity verification |
| `kyc()` | Director/representative KYC |
| `kyb()` | Business verification |

## Integration flows

### Corporate onboarding

```
1. Create Corporate (Server)     → POST /multi/corporates
2. Set Password (Client)         → Secure UI tokenize → POST /multi/passwords
3. Start KYB (Server)            → POST /multi/corporates/{id}/kyb/start
4. Complete KYB (Client)         → OpcUxSecureClient.kyb().init({ reference })
5. Poll KYB Status (Server)      → GET /multi/corporates/{id}/kyb → wait for APPROVED
```

```typescript
// Step 1: Create corporate (server-side)
const corporate = await fetch('https://sandbox.weavr.io/multi/corporates', {
  method: 'POST',
  headers: { 'api-key': API_KEY, 'programme-key': PROGRAMME_KEY, 'Content-Type': 'application/json' },
  body: JSON.stringify({
    rootUser: { name, surname, email, mobile, companyPosition, dateOfBirth },
    company: { type, name: companyName, registrationNumber, registrationCountry, businessAddress },
    baseCurrency: 'GBP'
  })
});

// Step 4: Complete KYB (client-side)
window.OpcUxSecureClient.associate(
  `Bearer ${authToken}`,
  () => {
    window.OpcUxSecureClient.kyb().init(
      document.getElementById('kyb-container'),
      { accessToken: authToken, reference: kybResponse.reference },
      (messageType, payload) => {
        if (messageType === 'complete') {
          // KYB submitted — poll for approval
        }
      },
      { lang: 'en' }
    );
  }
);
```

### Consumer onboarding

Same pattern as corporate but uses:
- `POST /multi/consumers` (step 1)
- `POST /multi/consumers/{id}/kyc/start` (step 3)
- `OpcUxSecureClient.consumer_kyc().init(...)` (step 4)
- `GET /multi/consumers/{id}/kyc` (step 5)

### Card issuance and display

```
1. Create Card (Server)          → POST /multi/managed_cards
2. Step-up Auth (Client)         → POST /multi/authentication/step-up → verify OTP
3. Display Card Number (Client)  → Secure UI cardNumber component
```

## Key concepts

| Concept | Description |
|---------|-------------|
| **Tokenization** | Sensitive data is tokenized client-side via Secure UI — your server never sees raw passwords, PINs, or card numbers |
| **Step-up auth** | Card display and PIN operations require additional OTP verification |
| **KYC/KYB** | Identity verification flows embedded via Secure UI components |
| **Programmes** | Your Weavr configuration determining available features and limits |
| **UI Key** | Client-side key for initializing Secure UI (different from API key) |

## Styling

Secure UI components accept style options:

```javascript
form.input('p', 'password', {
  placeholder: 'Enter password',
  style: {
    base: { color: '#333', fontSize: '16px', fontFamily: 'Arial' },
    focus: { borderColor: '#0066cc' },
    error: { color: '#cc0000' }
  }
});
```

## Common pitfalls

- **Never collect sensitive data directly** — always use Secure UI tokenization.
- **Associate before display** — call `OpcUxSecureClient.associate()` with a valid bearer token before using display or verification components.
- **Step-up required** — card number, CVV, and PIN display components fail without prior step-up authentication.
- **Cleanup on unmount** — in SPA frameworks (React, Vue), destroy Secure UI instances when components unmount to prevent memory leaks.

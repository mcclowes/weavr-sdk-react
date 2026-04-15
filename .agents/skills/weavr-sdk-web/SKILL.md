---
name: weavr-sdk-web
description: Integrate Weavr Secure UI components into web applications. Covers setup, tokenized password/passcode inputs, card number and CVV display, KYC/KYB verification, and CSS styling. Use when building browser-based Weavr integrations.
curated: true
version: 1.0.0
---

# Weavr Web SDK

Documentation: https://docs.weavr.io/sdks/web/

JavaScript library for embedding PCI-compliant financial services components into web applications. Sensitive data is tokenized client-side and never touches your servers.

## Setup

```html
<!-- Sandbox -->
<script src="https://sandbox.weavr.io/app/secure/static/client.1.js"></script>

<!-- Production -->
<script src="https://api.weavr.io/app/secure/static/client.1.js"></script>
```

```javascript
window.OpcUxSecureClient.init("{{ui_key}}");
```

## Components

### Input components (collect sensitive data)

```javascript
const form = window.OpcUxSecureClient.form();

// Password
const password = form.input("p", "password", { placeholder: "Password" });
password.mount(document.getElementById("password-container"));

// Confirm password
const confirm = form.input("cp", "confirmPassword", { placeholder: "Confirm" });
confirm.mount(document.getElementById("confirm-container"));

// Passcode (PIN-based auth)
const passcode = form.input("pc", "passCode", { placeholder: "Passcode" });
passcode.mount(document.getElementById("passcode-container"));

// Card PIN capture
const pin = form.input("pin", "cardPin", { placeholder: "PIN" });
pin.mount(document.getElementById("pin-container"));

// Tokenize all inputs
form.tokenize(function(tokens) {
  // tokens.password, tokens.passCode, etc. are secure tokens
  // Send to your server — never raw values
});
```

### Display components (show sensitive data)

Require step-up authentication first.

```javascript
// Associate bearer token
window.OpcUxSecureClient.associate(
  `Bearer ${authToken}`,
  function() {
    // Card number display
    window.OpcUxSecureClient.span("cardNumber", "card_id")
      .mount(document.getElementById("card-number"));

    // CVV display
    window.OpcUxSecureClient.span("cvv", "card_id")
      .mount(document.getElementById("cvv"));

    // PIN display
    window.OpcUxSecureClient.span("pin", "card_id")
      .mount(document.getElementById("pin"));
  }
);
```

### Verification components

```javascript
// Consumer KYC
window.OpcUxSecureClient.consumer_kyc().init(
  document.getElementById("kyc-container"),
  { accessToken: authToken, reference: kycReference },
  function(messageType, payload) {
    if (messageType === "complete") { /* KYC submitted */ }
  },
  { lang: "en" }
);

// Corporate KYB
window.OpcUxSecureClient.kyb().init(
  document.getElementById("kyb-container"),
  { accessToken: authToken, reference: kybReference },
  function(messageType, payload) {
    if (messageType === "complete") { /* KYB submitted */ }
  },
  { lang: "en" }
);

// Director KYC (within corporate flow)
window.OpcUxSecureClient.kyc().init(
  document.getElementById("kyc-container"),
  { accessToken: authToken, reference: kycReference },
  function(messageType, payload) { /* ... */ },
  { lang: "en" }
);
```

## Styling

Components accept style objects with state-based customization:

```javascript
form.input("p", "password", {
  placeholder: "Enter password",
  style: {
    base: { color: "#333", fontSize: "16px", fontFamily: "Arial, sans-serif" },
    empty: { color: "#999" },
    valid: { borderColor: "#4caf50" },
    invalid: { borderColor: "#f44336" },
    focus: { borderColor: "#2196f3" }
  }
});
```

## Common pitfalls

- **Init before use**: Always call `OpcUxSecureClient.init(uiKey)` before creating forms or components.
- **Associate before display**: Call `associate()` with a valid bearer token before mounting display components.
- **Step-up required**: Card number, CVV, and PIN display fail without prior step-up authentication (`POST /multi/authentication/step-up`).
- **Cleanup in SPAs**: Destroy component instances when unmounting in React/Vue/Angular to prevent memory leaks.
- **Tokenize callback**: The `tokenize()` callback provides tokens, not raw values — this is by design for PCI compliance.

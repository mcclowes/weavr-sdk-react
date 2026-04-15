---
name: weavr-sdk-react-native
description: Integrate Weavr Secure UI components into React Native and Expo apps. Covers installation, platform-specific setup, secure input and display components, biometric auth, and push provisioning for Apple and Google Wallet. Use when building cross-platform Weavr integrations.
curated: true
version: 1.0.0
---

# Weavr React Native SDK

Documentation: https://docs.weavr.io/sdks/react-native/

Cross-platform SDK for React Native and Expo apps, providing secure financial components on both iOS and Android with a unified API.

## Prerequisites

- React Native 0.75–0.81
- React 18.3–19
- Expo 51–54 (if using Expo)

## Setup

### 1. Install

```bash
npm install @weavr-io/secure-components-react-native
# or
yarn add @weavr-io/secure-components-react-native
```

### 2. iOS configuration (Podfile)

```ruby
source 'https://cdn.cocoapods.org'
source 'https://github.com/nicklockwood/iVersion.git'

# Add in your target block
pod 'Approov', :podspec => '...'
```

Then run `cd ios && pod install`.

### 3. Android configuration (build.gradle)

```groovy
// android/build.gradle
allprojects {
    repositories {
        mavenCentral()
    }
}

// android/app/build.gradle
configurations.all {
    resolutionStrategy {
        force "org.bouncycastle:bcprov-jdk15to18:1.68"
    }
}
```

### 4. Firebase setup

- Android: Add `google-services.json` to `android/app/`
- iOS: Add `GoogleService-Info.plist` to Xcode project

### 5. Expo-specific configuration

```javascript
// react-native.config.js
module.exports = {
  assets: ['./node_modules/@weavr-io/secure-components-react-native/assets'],
};
```

```typescript
// app.config.ts — add required permissions
{
  ios: {
    infoPlist: {
      NSCameraUsageDescription: "Capture identity documents",
      NSPhotoLibraryUsageDescription: "Upload identity documents",
      NSFaceIDUsageDescription: "Authenticate with Face ID"
    }
  }
}
```

### 6. Initialize

```typescript
import {
  initializeUXComponents,
  initializePSA,
  setAppCheckToken,
  Environment,
} from '@weavr-io/secure-components-react-native';

// Set App Check token (if using biometrics)
setAppCheckToken("");

// Initialize
initializeUXComponents(Environment.SANDBOX, "your_ui_key");
initializePSA(Environment.SANDBOX);
```

## Components

### Input components

```tsx
import {
  SecurePasswordTextField,
  SecurePasscodeTextField,
  SecureSegmentedPasscodeTextField,
} from '@weavr-io/secure-components-react-native';

// Password
<SecurePasswordTextField
  placeholder="Enter password"
  onTokenize={(token) => {
    // Send token to your server
  }}
/>

// Passcode
<SecurePasscodeTextField
  placeholder="Enter passcode"
  onTokenize={(token) => { /* ... */ }}
/>

// Segmented passcode (PIN-style boxes)
<SecureSegmentedPasscodeTextField
  onTokenize={(token) => { /* ... */ }}
/>
```

### Display components

```tsx
import {
  SecureCardNumberLabel,
  SecureCardCVVLabel,
  SecureCardPINLabel,
} from '@weavr-io/secure-components-react-native';

// Card number
<SecureCardNumberLabel
  cardId="card_id"
  accessToken={bearerToken}
/>

// CVV
<SecureCardCVVLabel
  cardId="card_id"
  accessToken={bearerToken}
/>

// Card PIN
<SecureCardPINLabel
  cardId="card_id"
  accessToken={bearerToken}
/>
```

### Push provisioning (Apple Pay and Google Pay)

```tsx
import { AddToWalletButton } from '@weavr-io/secure-components-react-native';

<AddToWalletButton
  cardId="card_id"
  accessToken={bearerToken}
  onSuccess={() => { /* Card added to wallet */ }}
  onError={(error) => { /* Handle error */ }}
/>
```

Requires certification from Apple and Google — contact Weavr Support.

### Biometric authentication

```typescript
import { PSA } from '@weavr-io/secure-components-react-native';

// Enroll
const enrollResult = await PSA.enroll();

// Authenticate
const authResult = await PSA.authenticate();
if (authResult.success) {
  const token = authResult.token; // Use for API calls
}
```

## Platform-specific styling

```tsx
// Android-specific props
<SecurePasswordTextField
  enableBorder={true}
  activeFieldBorderColor="#2196f3"
  inactiveFieldBorderColor="#cccccc"
/>

// iOS-specific props
<SecurePasswordTextField
  placeholder="Enter password"
  fieldBackgroundColor="#f5f5f5"
/>
```

## Common pitfalls

- **BouncyCastle on Android**: Pin version 1.68 to avoid Approov conflicts.
- **Pod install**: Run `cd ios && pod install` after installing the package.
- **Firebase required**: Both platforms need Firebase configured for biometrics and push provisioning.
- **Expo assets**: Export the asset path in `react-native.config.js` or fonts won't load.
- **Push provisioning certification**: Requires a 30-day minimum lead time with Apple/Google — plan ahead.
- **Step-up for display**: Card display components require step-up auth before they render.

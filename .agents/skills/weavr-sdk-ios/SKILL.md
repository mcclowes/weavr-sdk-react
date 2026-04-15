---
name: weavr-sdk-ios
description: Integrate Weavr Secure UI components into native iOS apps. Covers Swift Package Manager and CocoaPods setup, secure input and display components, KYC verification, biometric authentication, and push provisioning. Use when building iOS Weavr integrations.
curated: true
version: 1.0.0
---

# Weavr iOS SDK

Documentation: https://docs.weavr.io/sdks/ios/

Native iOS SDK (Swift) for embedding PCI-compliant financial services components with biometric authentication support.

## Prerequisites

- Xcode 16+
- Swift 5.9+
- Minimum iOS 15.1

## Setup

### Option 1: Swift Package Manager (recommended)

File > Add Package Dependencies > Enter:

```
https://github.com/weavr-io/secure-components-ios.git
```

### Option 2: CocoaPods

```ruby
# Podfile
source 'https://cdn.cocoapods.org'
source 'https://github.com/nicklockwood/iVersion.git'

pod 'WeavrComponents'
pod 'Approov', :podspec => 'https://raw.githubusercontent.com/nicklockwood/iVersion/master/Approov.podspec'
```

### Required permissions (Info.plist)

```xml
<key>NSPhotoLibraryUsageDescription</key>
<string>Upload identity documents</string>
<key>NSCameraUsageDescription</key>
<string>Capture identity documents and selfie</string>
<key>NSMicrophoneUsageDescription</key>
<string>Required for video verification</string>
<key>NSLocationWhenInUseUsageDescription</key>
<string>Verify your location during onboarding</string>
<key>NSFaceIDUsageDescription</key>
<string>Authenticate with Face ID</string>
```

### Initialize

```swift
import WeavrComponents

// Set Firebase App Check token (if using biometrics)
UXComponents.setAppCheckToken(token)

// Initialize
UXComponents.initialize(env: .SANDBOX, uiKey: "your_ui_key")
```

## Components

### Input components

```swift
// Password field
let passwordField = SecurePasswordField()
passwordField.placeholder = "Enter password"
view.addSubview(passwordField)

// Passcode field
let passcodeField = SecurePasscodeField()
view.addSubview(passcodeField)

// Segmented passcode (PIN-style boxes)
let segmentedPasscode = SecurePasscodeFieldStack()
view.addSubview(segmentedPasscode)

// Tokenize
passwordField.tokenize { token in
    // Send token to your server
}
```

### Display components

```swift
// Card number
let cardNumber = SecureCardNumberTextView()
cardNumber.cardId = "card_id"
cardNumber.accessToken = bearerToken
view.addSubview(cardNumber)

// CVV
let cvv = SecureCVVTextView()
cvv.cardId = "card_id"
cvv.accessToken = bearerToken
view.addSubview(cvv)

// Card PIN
let cardPin = SecureCardPINTextView()
cardPin.cardId = "card_id"
cardPin.accessToken = bearerToken
view.addSubview(cardPin)
```

### Biometric authentication

```swift
// Enroll
UXComponents.psa.enroll { result in
    switch result {
    case .success:
        // Enrolled
    case .failure(let error):
        // Handle error
    }
}

// Authenticate
UXComponents.psa.authenticate { result in
    switch result {
    case .success(let token):
        // Use token for API calls
    case .failure:
        // Fallback to passcode
    }
}
```

## Theming

```swift
let branding = BrandingConfig(
    primaryColor: UIColor(hex: "#1A73E8"),
    textColor: UIColor(hex: "#333333"),
    font: UIFont(name: "CustomFont", size: 16),
    buttonCornerRadius: 8
)
UXComponents.setBranding(branding)
```

## Storyboard integration

Components can also be added via Interface Builder:
1. Add a UIView to your storyboard
2. Set the class to the desired component (e.g., `SecurePasswordField`)
3. Set the module to `WeavrComponents`
4. Configure properties via the Attributes inspector

## Common pitfalls

- **Permissions required**: KYC components need camera, photo library, and location permissions — missing these causes silent failures.
- **Dynamic linking**: Approov framework requires dynamic linking — ensure "Embed & Sign" is set in Xcode.
- **Firebase required**: Biometric auth and push provisioning need Firebase App Check configured.
- **Initialize before use**: Call `UXComponents.initialize()` in `AppDelegate` or early in the app lifecycle.
- **Step-up for display**: Card number, CVV, and PIN display require step-up authentication first.

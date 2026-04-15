---
name: weavr-sdk-android
description: Integrate Weavr Secure UI components into native Android apps. Covers Gradle setup, secure input and display components, KYC verification, biometric authentication, and push provisioning. Use when building Android Weavr integrations.
curated: true
version: 1.0.0
---

# Weavr Android SDK

Documentation: https://docs.weavr.io/sdks/android/

Native Android SDK (Kotlin/Java) for embedding PCI-compliant financial services components with biometric authentication support.

## Prerequisites

- Android Studio
- Min SDK 24 (Android 7.0)
- Target/Compile SDK 36
- Kotlin 1.8.0+

## Setup

### 1. Add dependency

```kotlin
// build.gradle (app)
dependencies {
    implementation "io.weavr.components:secure-components:<latest_version>"
}
```

### 2. Configure repositories

```kotlin
// build.gradle (project) or settings.gradle
repositories {
    mavenCentral()
}
```

### 3. Add BouncyCastle configuration

```kotlin
// build.gradle (app)
configurations.all {
    resolutionStrategy {
        force "org.bouncycastle:bcprov-jdk15to18:1.68"
    }
}
```

### 4. Disable R8 full mode (if needed)

```properties
# gradle.properties
android.enableR8.fullMode=false
```

### 5. Initialize

```kotlin
// Application or Activity
UXComponents.initialize(context, Environment.SANDBOX, "your_ui_key")

// For biometric auth
UXComponents.psa.initialize(context, PSAEnvironment.SANDBOX, logger)
```

## Components

### Input components (XML layout)

```xml
<!-- Password input -->
<io.weavr.components.SecurePasswordEditText
    android:id="@+id/passwordInput"
    android:layout_width="match_parent"
    android:layout_height="wrap_content"
    app:hint="Enter password" />

<!-- Passcode input -->
<io.weavr.components.SecurePasscodeEditText
    android:id="@+id/passcodeInput"
    android:layout_width="match_parent"
    android:layout_height="wrap_content" />

<!-- Segmented passcode (PIN-style boxes) -->
<io.weavr.components.SecurePasscodeEditTextSegmented
    android:id="@+id/segmentedPasscode"
    android:layout_width="match_parent"
    android:layout_height="wrap_content" />
```

### Input components (programmatic)

```kotlin
val passwordInput = SecurePasswordEditText(context)
passwordInput.setHint("Enter password")

// Tokenize
passwordInput.tokenize { token ->
    // Send token to your server
}
```

### Display components

```xml
<!-- Card number display -->
<io.weavr.components.SecureCardNumberTextView
    android:id="@+id/cardNumber"
    android:layout_width="wrap_content"
    android:layout_height="wrap_content" />

<!-- CVV display -->
<io.weavr.components.SecureCVVTextView
    android:id="@+id/cvv"
    android:layout_width="wrap_content"
    android:layout_height="wrap_content" />

<!-- Card PIN display -->
<io.weavr.components.SecureCardPINTextView
    android:id="@+id/cardPin"
    android:layout_width="wrap_content"
    android:layout_height="wrap_content" />
```

### Biometric authentication

```kotlin
// Enroll biometrics
UXComponents.psa.enroll(activity) { result ->
    when (result) {
        is PSAResult.Success -> { /* Enrolled */ }
        is PSAResult.Failure -> { /* Handle error */ }
    }
}

// Authenticate with biometrics
UXComponents.psa.authenticate(activity) { result ->
    when (result) {
        is PSAResult.Success -> {
            val token = result.token // Use for API calls
        }
        is PSAResult.Failure -> { /* Fallback to passcode */ }
    }
}
```

## KYC configuration

Configure document upload types in `strings.xml`:

```xml
<resources>
    <string name="weavr_kyc_document_types">PASSPORT,DRIVING_LICENCE,ID_CARD</string>
</resources>
```

## Theming

```kotlin
val theme = UXComponentsTheme(
    primaryColor = Color.parseColor("#1A73E8"),
    textColor = Color.parseColor("#333333"),
    fontFamily = ResourcesCompat.getFont(context, R.font.custom_font)
)
UXComponents.setTheme(theme)
```

## Common pitfalls

- **R8 full mode**: Can cause runtime crashes — disable with `android.enableR8.fullMode=false`.
- **BouncyCastle conflicts**: Pin version 1.68 to avoid Approov dependency conflicts.
- **Initialize early**: Call `UXComponents.initialize()` before any component usage, ideally in `Application.onCreate()`.
- **Biometric fallback**: Always provide passcode/password fallback when biometric auth fails.
- **Firebase required**: Push provisioning and biometric features require Firebase setup with `google-services.json`.

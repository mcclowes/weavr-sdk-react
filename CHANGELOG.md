# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added

- `"use client"` directives on all browser-side modules for Next.js App Router compatibility
- SSR guards on `client.ts` entry points — helpful errors instead of crashes in non-browser environments
- Configurable timeouts on script load, `associateUserToken`, and `setUserToken`
- Proper init state machine (`idle | loading | ready | failed`) in `initWeavr`
- `onError` callback on `SecureInput` and `SecureSpan` to surface previously-swallowed errors
- `ariaLabel` prop on `SecureInput` and `SecureSpan`; `role="status"` / `role="alert"` on loading and error states
- `reassociate()` on `useAssociatedClient` return value for token refresh flows
- `format:check` step in CI
- `test:coverage` script
- ESLint configuration with TypeScript and React rules
- Prettier configuration for consistent code formatting
- Husky pre-commit hooks with lint-staged integration
- CONTRIBUTING.md with contribution guidelines
- This CHANGELOG.md file

### Changed

- `useAssociatedClient` no longer auto-prepends `"Bearer "` — pass the token exactly as the Weavr client expects it
- `useAssociatedClient` now safely handles unmount during async association
- `KYC` / `KYB` / `ConsumerKYC` now re-initialize when the `auth` object changes, and no longer re-run effects when only callback identities change
- `@typescript-eslint/no-explicit-any` and `react-hooks/exhaustive-deps` upgraded from `warn` to `error`

### Removed

- Unused `DisplayModule` type (it was never exported or used internally)

### Fixed

- Silent `catch {}` blocks in `SecureInput` / `SecureSpan` cleanup now log and surface errors via `onError`

## [0.1.0] - 2024-01-01

### Added

- Initial release of weavr-sdk-react
- **Components**
  - `SecureInput` - Secure iframe-based input for sensitive data (passwords, PINs, card details)
  - `SecureSpan` - Secure display component for masked card information
  - `KYB` - Know Your Business verification flow component
  - `KYC` - Know Your Customer verification flow component
  - `ConsumerKYC` - Consumer-focused KYC verification component
- **Hooks**
  - `useSecureForm` - Form management for multiple secure inputs with tokenization
  - `useAssociate` - Token association for stepped-up authentication
  - `useSetUserToken` - Alternative token setter hook
  - `useAssociatedClient` - Combined client initialization and token association
- **Context**
  - `WeavrProvider` - React context provider for Weavr client
  - `useWeavr` - Access provider state (client, loading, error, environment)
  - `useWeavrClient` - Get initialized client with error handling
- **Core**
  - `loadWeavrClient` - Dynamic script loading for Weavr client
  - `initWeavr` - Client initialization with UI key
  - `getWeavrClient` - Retrieve initialized client instance
  - `associateUserToken` - Associate user for authentication
  - `setUserToken` - Set user authentication token
- Full TypeScript support with comprehensive type definitions
- Storybook documentation with interactive examples
- Support for sandbox and production environments
- Dual module distribution (CommonJS + ESM)

[Unreleased]: https://github.com/mcclowes/weavr-sdk-react/compare/v0.1.0...HEAD
[0.1.0]: https://github.com/mcclowes/weavr-sdk-react/releases/tag/v0.1.0

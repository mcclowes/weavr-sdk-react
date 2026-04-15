---
name: weavr-glossary
description: Glossary of Weavr platform terms and concepts. Use to understand Weavr-specific terminology like programmes, managed accounts, managed cards, KYC/KYB, step-up authentication, and Secure UI.
curated: true
version: 1.0.0
---

# Weavr Glossary

Key terms and concepts used across the Weavr platform.

## Identities

- **Corporate** — A business entity onboarded onto the Weavr platform. Has a root user and may have authorized users. Requires KYB verification.
- **Consumer** — An individual (non-business) user onboarded onto the platform. Requires KYC verification.
- **Root user** — The primary user created when a corporate or consumer identity is registered. Has full permissions.
- **Authorized user** — An additional user added to a corporate identity with specific permissions (e.g., view-only, transaction approval).

## Verification

- **KYC (Know Your Customer)** — Identity verification for consumers. Checks identity documents, PEP status, and sanctions lists.
- **KYB (Know Your Business)** — Business verification for corporates. Checks company registration, directors, UBOs, and compliance.
- **UBO (Ultimate Beneficial Owner)** — An individual who ultimately owns or controls a corporate entity (typically 25%+ ownership).
- **PEP (Politically Exposed Person)** — An individual in a prominent public role. Subject to enhanced due diligence.

## Financial instruments

- **Managed account** — A digital account that holds funds. Can have an IBAN assigned for receiving wire transfers. Supports GBP, EUR, and USD.
- **Managed card** — A payment card (virtual or physical) linked to a managed account. Issued on Mastercard or Visa networks.
- **Virtual card** — An instantly issued digital card for online transactions. No physical form factor.
- **Physical card** / **Plastic card** — A printed card shipped to the cardholder. Requires activation after delivery.

## Transactions

- **Transfer** — An internal movement of funds between two managed accounts within the same programme.
- **Send** — A payment to a third-party beneficiary outside the platform.
- **Outgoing wire transfer (OWT)** — A bank transfer sent via SEPA, Faster Payments, or SWIFT to an external bank account.
- **Incoming wire transfer** — A bank transfer received into a managed account from an external source.
- **Beneficiary** — A saved third-party payee for sends and wire transfers.

## Authentication

- **API key** — Server-side credential included in the `api-key` header. Used for all API requests.
- **Programme key** — Identifies the specific programme configuration. Required when creating identities.
- **Bearer token** — JWT issued after login (`POST /multi/login_with_password`). Represents an authenticated user session.
- **Step-up authentication** — An additional OTP challenge required before sensitive operations (card display, PIN changes).
- **SCA (Strong Customer Authentication)** — Regulatory requirement for two-factor authentication on certain financial operations.

## Platform concepts

- **Programme** — A configuration on the Weavr platform that defines which products (accounts, cards), currencies, limits, and features are available. Each programme has its own API key and programme key.
- **Secure UI** — Weavr's client-side JavaScript SDK (`OpcUxSecureClient`) that handles sensitive data through tokenization. Ensures PCI compliance by keeping raw credentials off your servers.
- **Tokenization** — The process of replacing sensitive data (passwords, card numbers, PINs) with secure tokens via the Secure UI SDK.
- **UI key** — A client-side key used to initialize the Secure UI SDK. Different from the API key.
- **Sandbox** — The test environment at `https://sandbox.weavr.io`. Supports simulator endpoints for testing.
- **Simulator** — Sandbox-only API for simulating external events (deposits, card purchases, identity verification) that would normally come from banks or card networks.

## Amount format

All monetary amounts in the API use **minor units** (smallest currency denomination):

| Display | API value | Currency |
|---------|-----------|----------|
| £10.00 | `1000` | GBP |
| €25.50 | `2550` | EUR |
| $100.00 | `10000` | USD |

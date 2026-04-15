---
name: weavr-simulator
description: Test Weavr integrations in sandbox by simulating deposits, card transactions, KYC/KYB verification, wire transfers, and 2FA challenges. Use when building or debugging against the Weavr sandbox environment.
curated: true
version: 1.0.0
---

# Weavr Simulator API

API Reference: https://api.weavr.io/products/simulator/openapi

**Sandbox-only** testing tool for simulating financial operations that would normally come from external systems (bank transfers, card networks, identity verification providers).

Base URL: `https://sandbox.weavr.io`

## Authentication

All simulator endpoints require:

```
api-key: {{api_secret_key}}    # API Secret Key (not the regular API key)
```

Optional `call-ref` header (max 255 chars) for request correlation.

## Quick start

```typescript
// 1. Simulate a deposit into a managed account
const response = await fetch(
  'https://sandbox.weavr.io/accounts/${accountId}/deposit',
  {
    method: 'POST',
    headers: { 'api-key': API_SECRET_KEY, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      depositAmount: { currency: 'GBP', amount: 10000 },
      senderName: 'Test Sender',
      reference: 'Test deposit'
    })
  }
);
// Response: { "code": "COMPLETED" }
```

## Core endpoints

### Account deposits

```
POST /accounts/{account_id}/deposit     Simulate incoming wire (by account ID)
POST /accounts/deposit                  Simulate incoming wire (by IBAN)
```

**By account ID:**

```json
{
  "depositAmount": { "currency": "GBP", "amount": 10000 },
  "senderName": "Sender Name",
  "reference": "Payment reference",
  "paymentNetwork": "SEPA"
}
```

**By IBAN:**

```json
{
  "depositAmount": { "currency": "GBP", "amount": 10000 },
  "destinationIbanDetails": {
    "iban": "GB29NWBK60161331926819",
    "bankIdentifierCode": "NWBKGB2L"
  },
  "senderIbanDetails": {
    "name": "Sender Name",
    "iban": "DE89370400440532013000"
  },
  "paymentReference": "Payment reference",
  "paymentNetwork": "SEPA"
}
```

Payment networks: `SEPA`, `FASTER_PAYMENTS`, `SWIFT`, `BACS`, `CHAPS`, `RIX`

### Card transactions

```
POST /cards/{card_id}/purchase          Simulate card purchase (by ID)
POST /cards/purchase                    Simulate card purchase (by card number)
POST /cards/{card_id}/merchant_refund   Simulate refund (by ID)
POST /cards/merchant_refund             Simulate refund (by card number)
POST /cards/{card_id}/expire            Force card expiry
POST /cards/{card_id}/about_to_expire   Trigger about-to-expire state
POST /cards/{card_id}/renew             Simulate card renewal
```

**Card purchase:**

```json
{
  "merchantName": "Test Merchant",
  "merchantId": "MID123456",
  "merchantCategoryCode": "5411",
  "transactionAmount": { "currency": "GBP", "amount": 2500 },
  "transactionCountry": "GBR",
  "atmWithdrawal": false,
  "cardHolderPresent": true,
  "cardPresent": true
}
```

Response: `{ "code": "APPROVED" }`

### Identity verification

```
POST /consumers/{consumer_id}/verify    Auto-pass consumer KYC
POST /corporates/{corporate_id}/verify  Auto-pass corporate KYB
```

No request body required. Response: `204 No Content`.

Consumer verify sets: `emailVerified`, `mobileVerified`, `isPep=false`, `isSanctioned=false`

Corporate verify sets: `rootEmailVerified`, `rootMobileVerified`, `directorsVerified`, `UBOsVerified`, `basicCompanyChecksVerified`, `fullCompanyChecksVerified`

### Wire transfers

```
POST /wiretransfers/outgoing/{id}/accept    Complete outgoing wire transfer
POST /wiretransfers/outgoing/{id}/reject    Reject outgoing wire transfer
```

### 2FA challenges

```
POST /factors/{credentials_id}/challenges/{challenge_id}/verify_success   Pass 2FA
POST /factors/{credentials_id}/challenges/{challenge_id}/verify_invalid   Fail 2FA
POST /factors/{credentials_id}/challenges/{challenge_id}/verify_expired   Expire 2FA
```

### Linked accounts

```
POST /linked_accounts/{account_id}/set      Set linked account status
POST /linked_accounts/{account_id}/verify   Verify linked account steps
```

## Typical test flow

```
1. Create corporate/consumer    → POST /multi/corporates
2. Auto-verify identity         → POST /corporates/{id}/verify (simulator)
3. Create managed account       → POST /multi/managed_accounts
4. Simulate deposit             → POST /accounts/{id}/deposit (simulator)
5. Issue card                   → POST /multi/managed_cards
6. Simulate purchase            → POST /cards/{id}/purchase (simulator)
```

## Common pitfalls

- **Wrong API key**: Simulator uses the API **Secret** Key, not the regular API key.
- **Sandbox only**: These endpoints do not exist in production.
- **Amount format**: Amounts are in minor units (e.g., `2500` = 25.00 GBP).
- **KYC/KYB shortcut**: The verify endpoints skip the real verification flow entirely — useful for testing but does not exercise the Secure UI components.

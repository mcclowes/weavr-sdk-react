---
name: weavr-api
description: Answers questions about the Weavr Multi API, including managed accounts, cards, transactions, and authentication. Use whenever a developer asks how to integrate with Weavr, make API calls, handle errors, or understand request/response formats.
curated: true
version: 1.0.0
---

# Weavr Multi API

API Reference: https://api.weavr.io/products/multi/openapi

Weavr's Multi API is an embedded finance platform for issuing accounts, cards, and processing payments. It supports corporate and consumer identities with full KYC/KYB verification.

## Environments

| Environment | Base URL |
|-------------|----------|
| Sandbox | `https://sandbox.weavr.io` |
| Production | `https://api.weavr.io` |

## Authentication

Three header types used across the API:

```
api-key: {{api_key}}              # Server-side API key (all requests)
programme-key: {{programme_key}}  # Programme identifier (identity creation)
Authorization: Bearer {{token}}   # User auth token (after login)
Content-Type: application/json
```

## Quick start

```typescript
// 1. Create a corporate identity
// POST /multi/corporates
// Headers: api-key, programme-key, Content-Type: application/json
const corporate = await fetch('https://sandbox.weavr.io/multi/corporates', {
  method: 'POST',
  headers: {
    'api-key': API_KEY,
    'programme-key': PROGRAMME_KEY,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    rootUser: {
      name: 'John', surname: 'Smith', email: 'john@acme.com',
      mobile: { countryCode: '+44', number: '7700900123' },
      companyPosition: 'DIRECTOR',
      dateOfBirth: { year: 1985, month: 6, day: 15 }
    },
    company: {
      type: 'LLC', name: 'Acme Ltd', registrationNumber: '12345678',
      registrationCountry: 'GB',
      businessAddress: {
        addressLine1: '123 High St', city: 'London', postCode: 'EC1A 1BB', country: 'GB'
      }
    },
    baseCurrency: 'GBP'
  })
});

// 2. Set password (via Secure UI tokenization - never handle raw passwords)
// 3. Login: POST /multi/login_with_password → returns auth token
// 4. Start KYB: POST /multi/corporates/{id}/kyb/start
// 5. Create managed account: POST /multi/managed_accounts
// 6. Issue virtual card: POST /multi/managed_cards
```

## Core endpoints

### Identity management

```
POST   /multi/corporates                           Create corporate
GET    /multi/corporates/{id}                      Get corporate
PATCH  /multi/corporates/{id}                      Update corporate
POST   /multi/corporates/{id}/kyb/start            Start KYB verification
GET    /multi/corporates/{id}/kyb                  Get KYB status

POST   /multi/consumers                            Create consumer
GET    /multi/consumers/{id}                       Get consumer
PATCH  /multi/consumers/{id}                       Update consumer
POST   /multi/consumers/{id}/kyc/start             Start KYC verification
GET    /multi/consumers/{id}/kyc                   Get KYC status

POST   /multi/users                                Create authorized user
GET    /multi/users                                List users
GET    /multi/users/{id}                           Get user
PATCH  /multi/users/{id}                           Update user
POST   /multi/users/{id}/activate                  Activate user
POST   /multi/users/{id}/deactivate                Deactivate user
```

### Authentication

```
POST   /multi/login_with_password                  Login with password
POST   /multi/passwords                            Create password
PATCH  /multi/passwords                            Update password
POST   /multi/passwords/lost_password/start        Start password reset
POST   /multi/passwords/lost_password/validate     Complete password reset
POST   /multi/authentication/step-up               Request step-up auth
POST   /multi/authentication/step-up/verify        Verify step-up (OTP)
GET    /multi/authentication/factors               List auth factors
POST   /multi/authentication/otp/enroll            Enroll OTP
```

### Financial instruments

```
POST   /multi/managed_accounts                     Create managed account
GET    /multi/managed_accounts                     List accounts
GET    /multi/managed_accounts/{id}                Get account
GET    /multi/managed_accounts/{id}/statement      Get statement
POST   /multi/managed_accounts/{id}/iban           Assign IBAN to account
GET    /multi/managed_accounts/{id}/iban           Get IBAN details

POST   /multi/managed_cards                        Create managed card
GET    /multi/managed_cards                        List cards
GET    /multi/managed_cards/{id}                   Get card
PATCH  /multi/managed_cards/{id}                   Update card
POST   /multi/managed_cards/{id}/physical/activate Activate physical card
```

### Transfers and payments

```
POST   /multi/transfers                            Internal transfer (account to account)
GET    /multi/transfers/{id}                       Get transfer
POST   /multi/sends                                External send
GET    /multi/sends/{id}                           Get send
POST   /multi/outgoing_wire_transfers              Wire transfer (SEPA/Faster Payments)
GET    /multi/outgoing_wire_transfers/{id}         Get wire transfer
```

### Beneficiaries

```
POST   /multi/beneficiaries                        Create beneficiary
GET    /multi/beneficiaries                        List beneficiaries
GET    /multi/beneficiaries/{id}                   Get beneficiary
DELETE /multi/beneficiaries/{id}                   Delete beneficiary
```

## Common request bodies

### Create managed account

```json
{
  "profileId": "string",
  "friendlyName": "Main Account",
  "currency": "GBP"
}
```

### Create managed card

```json
{
  "profileId": "string",
  "friendlyName": "My Card",
  "currency": "GBP",
  "cardholderMobileNumber": { "countryCode": "+44", "number": "7700900123" },
  "billingAddress": {
    "addressLine1": "123 High St",
    "city": "London",
    "postCode": "EC1A 1BB",
    "country": "GB"
  }
}
```

### Create transfer

```json
{
  "profileId": "string",
  "source": { "type": "managed_accounts", "id": "source_id" },
  "destination": { "type": "managed_accounts", "id": "dest_id" },
  "destinationAmount": { "currency": "GBP", "amount": 1000 }
}
```

## Key enums

| Category | Values |
|----------|--------|
| Company types | `LLC`, `SOLE_TRADER`, `PUBLIC_LIMITED_COMPANY`, `PRIVATE_LIMITED_COMPANY`, `PARTNERSHIP` |
| Company positions | `DIRECTOR`, `SHAREHOLDER`, `AUTHORISED_REPRESENTATIVE`, `ULTIMATE_BENEFICIAL_OWNER` |
| KYC/KYB states | `NOT_STARTED`, `PENDING_REVIEW`, `APPROVED`, `REJECTED` |
| Card states | `ACTIVE`, `INACTIVE`, `BLOCKED`, `DESTROYED` |
| Transaction states | `PENDING`, `COMPLETED`, `REJECTED`, `FAILED` |

## Response codes

| Code | Description |
|------|-------------|
| 200 | Success |
| 201 | Created |
| 400 | Bad request (validation error) |
| 401 | Unauthorized (invalid/missing auth) |
| 403 | Forbidden (insufficient permissions) |
| 404 | Not found |
| 409 | Conflict (duplicate resource) |
| 429 | Rate limited |

## Common pitfalls

- **Password handling**: Never collect passwords directly. Use Weavr Secure UI components to tokenize sensitive data client-side.
- **KYC/KYB required**: Identities must pass verification before financial instruments can be used.
- **Step-up auth**: Card display and PIN operations require additional step-up authentication.
- **IBAN assignment**: Accounts must be `ACTIVE` before an IBAN can be assigned.
- **Amount format**: Monetary amounts are in minor units (e.g., `1000` = 10.00 GBP).

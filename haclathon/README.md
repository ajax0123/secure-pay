# Secure Digital Wallet

A secure digital wallet application built in three phases with a MongoDB-backed Node.js API, a React 18 + TypeScript frontend, and layered security controls for authentication, encryption, fraud detection, auditability, and real-time alerts.

## 7-Layer Security

**Layer 1: Authentication.** User sign-in uses bcrypt password hashing, JWT access tokens, a 24-hour expiry window, and login throttling so repeated failures temporarily lock the account. Sensitive session actions are tied to the authenticated user and the backend issues transaction PIN tokens only after credential verification.

**Layer 2: Encryption.** Wallet balances and transaction payloads are encrypted using AES-256-GCM before storage. The API never stores balances in plaintext, and receipts/transactions are decrypted only when the authenticated owner requests them.

**Layer 3: Privacy.** KYC identity values are reduced to SHA-256 hashes and only masked identity formats are shown back to the user. The backend never returns raw identity data, which keeps personally identifiable information out of logs and API responses.

**Layer 4: Fraud Detection.** Every send-money request passes through rule-based scoring using transaction size, recent velocity, and device novelty. The result drives fraud flags, investigation routing, and any account freeze that must occur from a fraud report with a high risk score.

**Layer 5: Audit Logging.** Sensitive actions such as login, transfer, fraud reporting, PIN failures, and account freezes write audit entries into MongoDB. This gives the admin timeline, investigation engine, and incident response workflows a durable security trail.

**Layer 6: Zero-Knowledge Identity.** Raw identity values are transformed into SHA-256 hashes before they reach persistence. That means the application can verify or compare identity references without ever storing or displaying the original value.

**Layer 7: Security Hardening.** The server uses Helmet, a strict CORS origin allowlist, and rate limiting at the global and login route levels. The frontend mirrors that hardening with protected routes, room-scoped socket joins, and authenticated receipt downloads.

## Automated 7-Layer Security Script

Use the repository-level shell script to run a defense-in-depth security audit across host baseline, secret hygiene, auth controls, API hardening, crypto policy, dependency risk, and auditability.

```bash
cd ..
chmod +x seven-layer-security.sh
./seven-layer-security.sh
```

Optional remediation mode applies safe hardening steps (such as tightening `server/.env` file permissions):

```bash
./seven-layer-security.sh --apply
```

Reports are generated under `haclathon/security-reports/`.

## Setup

1. Clone the repository.
2. Install backend dependencies:

```bash
cd server
npm install
```

3. Install frontend dependencies:

```bash
cd ../client
npm install
```

4. Configure environment variables:
   - Copy [server/.env.example](server/.env.example) to [server/.env](server/.env)
   - Fill in MongoDB, JWT, AES, and email credentials

5. Seed demo data:

```bash
node server/seed.js
```

6. Start the backend:

```bash
cd server
npm run dev
```

7. Start the frontend in a second terminal:

```bash
cd client
npm run dev
```

## Demo Credentials

| Role | Email | Password | PIN |
|---|---|---:|---:|
| Admin | admin@wallet.demo | Admin@123 | 1111 |
| User 1 | alice@wallet.demo | Alice@123 | 1234 |
| User 2 | bob@wallet.demo | Bob@123 | 5678 |
| User 3 | carol@wallet.demo | Carol@123 | 9012 |

## API Reference

| Method | Endpoint | Purpose |
|---|---|---|
| POST | /api/auth/signup | Register a new wallet user |
| POST | /api/auth/login | Authenticate and issue JWT |
| POST | /api/auth/kyc | Hash and store identity |
| POST | /api/auth/logout | Deactivate active session |
| GET | /api/wallet/balance | Fetch decrypted wallet balance |
| POST | /api/wallet/verify-pin | Return short-lived PIN token |
| POST | /api/wallet/send | Transfer money after fraud and PIN checks |
| GET | /api/wallet/transactions | Paginated wallet history |
| GET | /api/wallet/receipt/:transactionId | Download PDF receipt |
| POST | /api/wallet/security-lock | Enable or disable security lock |
| GET | /api/wallet/sessions | List active sessions |
| DELETE | /api/wallet/sessions/:id | Revoke one session |
| POST | /api/fraud/report | Create fraud report and trigger investigation |
| GET | /api/fraud/logs | List the user’s fraud reports |
| POST | /api/dispute/create | Create a dispute case |
| GET | /api/dispute/status/:id | Read dispute status |
| GET | /api/admin/fraud-reports | Admin list of open cases |
| POST | /api/admin/freeze-account | Freeze an account |
| POST | /api/admin/unfreeze-account | Unfreeze an account |
| POST | /api/admin/close-case | Close a dispute case |
| GET | /api/admin/users | Admin user list with risk scores |
| GET | /api/admin/case-timeline/:fraudReportId | Audit log timeline for a fraud case |

## Architecture Diagram

```text
[React + Vite Client]
        |
        | Axios + JWT + Socket.IO
        v
[Express API Gateway]
   |   |    |     |
   |   |    |     +--> [Admin Routes]
   |   |    +---------> [Fraud + Dispute]
   |   +---------------> [Wallet]
   +-------------------> [Auth]
        |
        v
 [MongoDB / Mongoose]
        |
        +--> Users, Transactions, FraudReports, Disputes, Sessions, AuditLogs
        |
        +--> AES-GCM encrypted balances + payloads
        |
        +--> PDF receipts + email alerts + real-time fraud sockets
```

## Hackathon Talking Points

1. The wallet keeps balances encrypted at rest while still letting the API return decrypted balances to the authenticated owner.
2. Fraud reporting is not just a form submission; it triggers risk scoring, account freeze rules, audit logging, email alerts, and socket notifications.
3. The admin timeline is backed by audit logs, which makes the investigation flow explainable instead of opaque.
4. The UI is built for a fintech demo: dark, focused, responsive, and centered on balance, trust, and safety.
5. Session tracking, PIN lockout, and security lock controls give the demo concrete security controls beyond just login.
6. The system is ready for productization because the same services can be extended in Phase 4 without reworking the trust model.

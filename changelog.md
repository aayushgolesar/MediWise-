# 📦 MediWise — Changelog

All notable changes to the MediWise project are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/), and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

> **AI Note**: Update this file after every meaningful change. Include version bump, date, and categorized entries. Never overwrite existing entries — only append.

---

## [Unreleased]

> Changes that are staged or in progress but not yet assigned a version number.

### Added
- Phase 6 Vitest test harness (`vitest.config.ts`, `npm test`, `npm run test:coverage`) configured with `@vitest/coverage-v8` and `supertest`.
- Modular healthcare business logic library ([`src/utils/businessLogic.ts`](file:///d:/Agentic%20AI%20Workshop/MediWise-/src/utils/businessLogic.ts)) covering CDSCO drug schedule enforcement, escrow state transitions, auto-quarantine trigger criteria, and reassignment scoring.
- Comprehensive test suites in `tests/`:
  - `tests/validators.test.ts`: ABHA ID (Luhn mod-10 & ABDM handle), State Pharmacy Council registration number, and CDSCO Form 20B/21B format.
  - `tests/businessLogic.test.ts`: 22 unit tests for Schedule H/H1/OTC/X restrictions, escrow state machine, and SLA failover algorithm.
  - `tests/compliance.test.ts`: CDSCO Form 20B/21B immutable audit trail integrity and DISHA health privacy plaintext credential protection.
  - `tests/orderFlow.test.ts`: 8 integration tests covering order creation, cryptographic HMAC verification, escrow locking, delivery OTP confirmation, and 7-day SLA auto-release.
  - `tests/authAndPartner.test.ts`: 8 tests covering registration validation, JWT/cookie authentication, and pharmacist order intake.
  - `tests/adminFlow.test.ts`: 4 tests for quarantine item release, SLA reassignment force-assign, and dispute resolution.

### Security
- Verified zero plaintext password storage in database (all hashes strictly scrypt-derived).
- Verified audit log metadata sanitation ensuring no plaintext credentials or sensitive keys are stored.
- Confirmed `GEMINI_API_KEY` is server-side only; client chat and OCR never call Gemini directly.
- Non-overridable CDSCO system prompt on `/api/ai/chat`; client-supplied system instructions are ignored.

---

## [2.0.0] — 2026-09-08

### Added

#### 🔐 Authentication System
- `AuthView.tsx` — full authentication screen supporting 4 user roles (Patient, Pharmacist, Admin, OEM)
- Sign-in flow with email/phone and password
- Registration flow with role-specific fields:
  - Patient: ABHA ID, date of birth, gender
  - Pharmacist: Pharmacy hub name, registration number, CDSCO license
  - Admin: Admin code verification
  - OEM: Company name, CDSCO manufacturer license
- Mandatory auth gate in `App.tsx` — app is inaccessible without login
- Role-based post-login redirect (patient → marketplace, pharmacist → partner portal, admin → super admin, OEM → OEM portal)
- Toast notification system for login/logout events
- `handleSignOut()` flow with full session reset

#### 🛒 Marketplace & Medicine Discovery
- `MarketplaceView.tsx` — full medicine browsing and search interface
- 7 therapeutic category filters: Cardiovascular, Diabetes, Antibiotics, Gastrointestinal, Pain & Fever, Respiratory, Vitamins & Supplements
- CDSCO drug schedule badges (OTC / Schedule H / Schedule H1)
- Multi-pharmacy offer comparison with distance (km), SLA (minutes), price, and discount
- Pack size selector (unit, 30-count, 90-count) with tiered discounts
- Bioequivalent verification indicator per medicine
- MRP vs. discounted price display with generic savings callout
- Hologram and hub count indicators per pharmacy offer

#### 💳 Checkout Flow
- `CheckoutView.tsx` — full checkout with order summary and patient profile
- Patient profile selector supporting self + family members
- Prescription upload interface for Schedule H and H1 medicines
- `PrescriptionAudit` record display with OCR verification status
- OTP generation for delivery confirmation
- Escrow payment summary: itemized fees (packaging, delivery, platform convenience, generic savings)
- Order placement button with navigation to tracking view

#### 📦 Order Tracking
- `OrderTrackingView.tsx` — 6-stage visual order pipeline
- Pipeline stages: Escrow Locked → Pharmacist Audit → Packaging → Dispatched → Out for Delivery → Delivered
- Courier details: name, vehicle, rating, cold-chain status, distance
- Hologram seal hash display for tamper verification
- Escrow status panel (`Held in Escrow` / `Released` / `Refunded`)
- Itemized financials recap
- Direct link to dispute filing

#### 🏪 Pharmacist Partner Portal
- `PartnerPortalView.tsx` — pharmacist order management dashboard
- Incoming order queue with SLA countdown timers (15-minute acceptance window)
- Prescription audit interface with OCR verification status
- Inventory panel with batch number and expiry tracking
- Hub performance metrics (orders filled, SLA compliance, rating)

#### 🛡️ Admin Operations Suite
- `QuarantineConsoleView.tsx` — inventory quarantine management
  - Severity levels: Critical, High, Medium, Low
  - Quarantine reasons: Price Drift Violation, Stale Ingestion Sync, Batch Recall, SLA Breach, License Expired
  - Release / Escalate actions
- `ReassignmentEngineView.tsx` — failed order reassignment engine
  - Countdown timers per order
  - Scored candidate hub list (Optimal / Secondary / Excluded)
  - Force-assign and auto-assign actions
- `DisputeConsoleView.tsx` — evidence-based dispute resolution
  - Side-by-side photo comparison (customer claim vs. dispatch baseline)
  - Seal barcode mismatch detection
  - GPS duration and shock spike evidence
  - Escrow refund / reject / hub penalty actions
- `SuperAdminView.tsx` — multi-tenant hub monitoring
  - Per-hub: DB latency, active orders, storage, CDSCO license, status
  - Hub status indicators: Active, Degraded, Syncing, Maintenance

#### 🏭 OEM Portal
- `OemPortalView.tsx` — manufacturer product dashboard
- SKU listing with CDSCO approval status
- Bioequivalent certification tracking per product

#### 🤖 Noor AI Assistant
- `AskNoorWidget.tsx` — floating AI chat drawer powered by Google Gemini
- "Ask Noor 24/7 Rx AI" floating launcher button (authenticated users only)
- `NoorModerationView.tsx` — moderation queue for Noor AI responses
- Gemini integration via `@google/genai` SDK

#### 🏗️ Infrastructure & Types
- `src/types/index.ts` — complete TypeScript type system:
  - `AppRole`, `UserRole`, `AuthUser`
  - `Medicine`, `MedicinePackOption`, `PharmacyOffer`
  - `PatientProfile`, `PrescriptionAudit`
  - `OrderDetail`, `QuarantineItem`, `ReassignmentTask`
  - `DisputeCase`, `TenantHub`
- `src/data/mockData.ts` — full mock dataset (medicines catalog, pharmacy offers, orders, disputes, hubs)
- `Header.tsx` — responsive navigation with role switcher and user profile
- TailwindCSS v4 with `@tailwindcss/vite` plugin
- Motion (Framer Motion) for UI animations
- Lucide React for iconography
- Express.js backend scaffold with `dotenv`
- `.env.example` with `GEMINI_API_KEY` and `APP_URL` documentation

### Changed
- N/A (initial release)

### Fixed
- N/A (initial release)

### Removed
- N/A (initial release)

---

## [1.0.0] — 2026-09-01

> **Note**: v1.0.0 was the initial project scaffold. All feature development began in v2.0.0.

### Added
- React + Vite + TypeScript project scaffolding
- Basic `App.tsx` entry point
- TailwindCSS integration
- `package.json` with initial dependencies
- `.gitignore` with standard Node.js exclusions
- `.env.example` template

---

## How to Update This Changelog

When making changes, add a new entry at the top under `[Unreleased]`, then bump to a new version on release.

### Version Numbering Guide

| Change Type | Version Bump | Example |
|-------------|-------------|---------|
| Breaking change or major new system | **Major** (X.0.0) | Authentication system, new user role |
| New feature, backward-compatible | **Minor** (x.Y.0) | New view, new API endpoint |
| Bug fix, UI tweak, refactor | **Patch** (x.y.Z) | Fix escrow display bug |

### Entry Template

```markdown
## [X.Y.Z] — YYYY-MM-DD

### Added
- Description of new feature or file

### Changed
- Description of modified behavior (include what changed and why)

### Fixed
- Description of bug fixed (include root cause if known)

### Removed
- Description of deleted feature, file, or dependency
```

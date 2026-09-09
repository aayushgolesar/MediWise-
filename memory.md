# 🧠 MediWise — Long-Term Project Memory

> This file is the persistent AI memory for MediWise. It must be kept up-to-date after every significant development session. AI assistants must read this file at the start of every task to understand the full project context before writing any code.

---

## 1. Project Overview

**MediWise** is a full-stack, multi-tenant SaaS platform for **generic medicine price parity and clearinghouse operations** in India, regulated under the **CDSCO Gateway** framework.

The platform connects **patients** seeking affordable generic medicines with **licensed pharmacy micro-hubs**, enforces regulatory compliance (CDSCO Drugs & Cosmetics Act, 1940; DISHA Health Privacy Standards), and provides back-office tools for **pharmacists**, **admins**, and **OEM manufacturers**.

The AI assistant "**Noor**" provides 24/7 medicine Q&A, Rx guidance, and content moderation support powered by Google Gemini.

**Status**: Active development — Phase 6 Testing & Compliance is in progress (Vitest test harness, regulatory unit & integration suites active with 55 passing tests).

---

## 2. Tech Stack

### Frontend

| Layer | Technology | Version |
|-------|-----------|---------|
| UI Framework | React | 19.0.1 |
| Build Tool | Vite | 6.2.3 |
| Language | TypeScript | 5.8.2 |
| Styling | TailwindCSS | 4.1.14 |
| Icons | Lucide React | 0.546.0 |
| Animation | Motion (Framer Motion) | 12.23.24 |
| Routing | None (state-based SPA) | — |

### Backend

| Layer | Technology | Version |
|-------|-----------|---------|
| Server | Express.js | 4.21.2 |
| Runtime | Node.js (tsx) | Latest |
| Environment | dotenv | 17.2.3 |

### AI / External Services

| Service | SDK | Purpose |
|---------|-----|---------|
| Google Gemini | `@google/genai` v2.4.0 | Noor AI chat + moderation |

### Infrastructure (Planned)

| Component | Technology | Status |
|-----------|-----------|--------|
| Database | PostgreSQL (schema-per-tenant) | Planned |
| Auth | JWT + ABHA ID integration | Implemented (SQLite sessions) |
| File Storage | GCP Cloud Storage | Planned |
| Deployment | Google Cloud Run | Planned |
| CI/CD | GitHub Actions | Planned |

---

## 3. Features Completed

### ✅ Authentication & User Management
- [x] Role-based login screen (`AuthView`) supporting 4 roles: Patient, Pharmacist, Admin, OEM
- [x] User registration flow with ABHA ID, pharmacy registration number, CDSCO license fields
- [x] Mandatory authentication gate — no app access without login
- [x] Auth state management with toast notifications in `App.tsx`
- [x] Sign-out flow with session reset
- [x] Role-based post-login redirect (patient → marketplace, pharmacist → partner portal, admin → super admin, OEM → OEM portal)

### ✅ Marketplace & Discovery
- [x] Medicine search and browsing (`MarketplaceView`)
- [x] 7 therapeutic categories: Cardiovascular, Diabetes, Antibiotics, Gastrointestinal, Pain & Fever, Respiratory, Vitamins & Supplements
- [x] CDSCO schedule badges (OTC, Schedule H, Schedule H1)
- [x] Multi-pharmacy offer comparison with distance, SLA, and pricing
- [x] Pack size selection (unit, 30, 90 counts) with discount tiers
- [x] Bioequivalent verification indicators
- [x] "Ask Noor" quick launch from marketplace

### ✅ Checkout & Ordering
- [x] Checkout flow (`CheckoutView`) with selected offer and pack summary
- [x] Patient profile selector (self/family members)
- [x] Prescription (Rx) upload interface for Schedule H/H1 medicines
- [x] Prescription audit record display (`PrescriptionAudit`)
- [x] OTP-based delivery confirmation setup
- [x] Escrow payment summary with itemized fee breakdown
- [x] Order placement with navigation to tracking

### ✅ Order Tracking
- [x] Real-time-style order tracking (`OrderTrackingView`)
- [x] 6-stage pipeline: Escrow Lock → Pharmacist Audit → Packaging → Dispatch → Out for Delivery → Delivered
- [x] Courier live location indicators
- [x] Cold-chain verification status
- [x] Hologram seal hash display
- [x] Escrow status and financials panel
- [x] Direct dispute filing link

### ✅ Pharmacist Partner Portal
- [x] Incoming order queue (`PartnerPortalView`)
- [x] Prescription audit interface with OCR verification
- [x] Inventory management view
- [x] SLA timer with countdown for order acceptance
- [x] Hub performance metrics

### ✅ Admin Operations
- **Quarantine Console** (`QuarantineConsoleView`): Monitor and release/quarantine inventory with price drift, stale sync, and batch recall detection
- **Reassignment Engine** (`ReassignmentEngineView`): Auto-reassign failed orders to alternate pharmacy hubs with scored candidate matching
- **Dispute Console** (`DisputeConsoleView`): Evidence-based dispute resolution with photo comparison, barcode verification, and escrow release/refund
- **Super Admin Dashboard** (`SuperAdminView`): Multi-tenant hub monitoring, DB latency, active orders, storage usage

### ✅ OEM Portal
- [x] Manufacturer product listing dashboard (`OemPortalView`)
- [x] CDSCO approval status per SKU
- [x] Bioequivalent certification tracking

### ✅ Noor AI Assistant
- [x] Floating "Ask Noor" button (always accessible when authenticated)
- [x] Full chat drawer/widget (`AskNoorWidget`) routed through the server-side `/api/ai/chat` proxy
- [x] Moderation dashboard for Noor responses (`NoorModerationView`) with approve/redact actions
- [x] Non-overridable system prompt with CDSCO compliance disclaimers
- [x] Per-user chat rate limit (20 req/min) and conversation token window (last 8 turns / 12k chars)
- [x] All Noor replies logged to `noor_moderation_log` with Schedule X / H1-bypass auto-flagging

### ✅ Prescription OCR (Phase 5)
- [x] `POST /api/rx/parse` Gemini multimodal extraction of doctor, drug, dosage, duration, and schedule
- [x] Per-field confidence scores; values below 0.75 flagged for pharmacist review
- [x] Rejection of non-prescription images (ID cards, blank pages, packaging)
- [x] Checkout Rx upload auto-populates `PrescriptionAudit`

### ✅ Backend Foundation (Phase 2)
- [x] SQLite development schema and idempotent seed script (`server/schema.sql`, `server/seed.ts`)
- [x] Express route scaffolding for authentication, medicines, orders, partner operations, admin operations, and Noor AI
- [x] Typed frontend API client modules in `src/api/`
- [x] Local API proxy plus `server`, `seed`, and `dev:full` npm scripts
- [x] Migrate all frontend view imports from `mockData.ts` to typed API calls
- [x] Global React ErrorBoundary with recovery and state reset
- [x] Unified reactive toast notification system (`toastStore.ts`, `ToastContainer.tsx`) with automatic API error interceptor
- [ ] Replace SQLite development database with planned PostgreSQL schema-per-tenant deployment (Deferred to Phase 7)

### ✅ Authentication & API Security (Phase 3)
- [x] scrypt password hashing for registered and seeded users
- [x] Signed short-lived access and refresh sessions in HTTP-only, same-site cookies
- [x] JWT authentication middleware and route-level role checks
- [x] API CORS restriction, security headers, and request rate limiting
- [x] ABHA ID format validation (14-digit alphanumeric, check digit / Luhn algorithm, @abdm handle)
- [x] Pharmacist registration number verification (State Pharmacy Council pattern validation)
- [x] CDSCO license number format validation (Form 20B/21B retail & wholesale)
- [x] CSRF double-submit token protection for state-mutating endpoints (`POST`, `PUT`, `DELETE`)
- [x] Immutable `audit_log` table writes for registration, login, dispensing, escrow lock, escrow release/refund, disputes, and reassignment

### ✅ Payments & Escrow (Phase 4)
- [x] Razorpay / payment gateway order creation & cryptographic HMAC-SHA256 signature verification (`server/routes/payments.ts`)
- [x] Full Escrow State Machine: `locked_escrow` → OTP confirmation → `released_to_pharmacy`, dispute hold (`under_dispute`), and dispute refund
- [x] Asynchronous gateway webhook handler (`POST /api/payments/webhook`)
- [x] Automatic SLA timeout escrow release endpoint (`/api/orders/:id/auto-release`)
- [x] Admin manual escrow release and refund override actions (`/api/admin/escrow/:orderId/release`, `/refund`)
- [x] 18% GST calculation (9% CGST + 9% SGST on platform convenience fee) with statutory HSN 3004 / SAC 998553 codes
- [x] Digital GST Tax Invoice generation and interactive view/print modal in `OrderTrackingView`

### ✅ Global UI
- [x] Responsive header with role-based navigation (`Header`)
- [x] Dark-mode-first design system (slate + emerald palette)
- [x] Compliance footer (Drugs & Cosmetics Act, CDSCO Form 20B/21B, DISHA)
- [x] Global reactive toast notification system supporting success, error, warning, and info banners
- [x] Graceful ErrorBoundary fallback UI with workspace recovery action

---

## 4. Pending Features

### 🔴 High Priority

- [ ] **Testing & Compliance (Phase 6)** — Vitest unit coverage, Playwright E2E, CDSCO/DISHA audit
- [ ] **Push notifications** — order status updates via FCM or WebSockets

### 🟡 Medium Priority

- [ ] **Real-time order tracking** — WebSocket or SSE for live courier GPS
- [ ] **Multi-language support** — Hindi, Tamil, Bengali (India's key generic medicine markets)
- [ ] **Mobile-responsive optimization** — full audit of all views on 375px viewport
- [ ] **Unit tests** — Vitest test suite for critical business logic (schedule validation, escrow states)
- [ ] **E2E tests** — Playwright for full order flow

### 🟢 Low Priority / Future

- [ ] **PWA support** — offline-capable for low-connectivity areas
- [ ] **Analytics dashboard** — order volume, dispute rates, hub performance trends
- [ ] **Noor voice interface** — speech-to-text for accessibility
- [ ] **Doctor portal** — Rx issuance and digital signature integration
- [ ] **Cold-chain IoT integration** — real temperature sensor data from courier vehicles

---

## 5. API Endpoints

> The following endpoints are implemented against the local SQLite development database.

### Authentication

```
POST   /api/auth/register          Register a new user
POST   /api/auth/signin            Sign in and receive session token
POST   /api/auth/signout           Invalidate session
GET    /api/auth/me                Get current authenticated user
```

### Medicines & Marketplace

```
GET    /api/medicines              List all medicines (with filters: category, schedule, search)
GET    /api/medicines/:id          Get medicine details
GET    /api/medicines/:id/offers   Get pharmacy offers for a medicine
```

### Orders

```
POST   /api/orders                 Place a new order (locks escrow)
GET    /api/orders/:orderId        Get order detail + tracking status
PUT    /api/orders/:orderId/otp    Confirm delivery with OTP
```

### Partner Portal (Pharmacist)

```
GET    /api/partner/orders         Get incoming orders for hub
PUT    /api/partner/orders/:id/accept   Accept order
PUT    /api/partner/orders/:id/reject   Reject order (triggers reassignment)
GET    /api/partner/inventory      Get hub inventory
```

### Admin Operations

```
GET    /api/admin/quarantine       Get quarantined inventory items
PUT    /api/admin/quarantine/:id   Release or escalate quarantine item
GET    /api/admin/reassignment     Get pending reassignment tasks
POST   /api/admin/reassignment/:orderId/assign   Force assign to hub
GET    /api/admin/disputes         Get open dispute cases
PUT    /api/admin/disputes/:id/resolve   Resolve dispute (refund/reject)
GET    /api/admin/hubs             Get all tenant hubs (SuperAdmin)
```

### AI / Noor

```
POST   /api/ai/chat                Send message to Noor (proxies Gemini)
GET    /api/ai/moderation          Get Noor response moderation queue (admin)
PUT    /api/ai/moderation/:id      Approve or redact a Noor response (`{ action: 'approve' | 'redact' }`)
```

### Prescription OCR

```
POST   /api/rx/parse               Upload Rx image (base64) and extract PrescriptionAudit fields
```

---

## 6. Database Schema Summary

> Schema is per-tenant (per pharmacy hub). Each hub has its own PostgreSQL schema identified by `schemaName`.

### Global Schema (Shared)

```sql
-- Users table
users (id, name, email, phone, password_hash, role, abha_id, pharmacist_reg_no, cdsco_license, avatar_url, created_at)

-- Tenant hubs registry
tenant_hubs (tenant_id, hub_name, schema_name, city, locality, cdsco_license, status, created_at)
```

### Per-Tenant Schema (Replicated per Hub)

```sql
-- Medicine catalog (global reference, cached per tenant)
medicines (id, brand_name, generic_name, strength, dosage_form, therapeutic_category, schedule, mrp_reference, cdsco_approved, bioequivalent_verified, bioequivalent_to)

-- Pharmacy inventory
inventory (id, medicine_id, hub_id, stock_count, batch_number, expiry_date, reported_price, floor_price, last_heartbeat_at, status)

-- Orders
orders (order_id, patient_id, hub_id, medicine_id, pack_size, placed_at, delivery_eta, delivery_otp, status, escrow_status, total_paid)

-- Prescription audits
prescription_audits (rx_id, order_id, file_url, doctor_name, doctor_reg_no, hospital, dosage, duration_days, frequency, dispense_limit, ocr_verified, needs_pharmacist_review, confidence_json, schedule_category)

-- Noor moderation
noor_moderation_log (id, session_id, patient_name, user_prompt, bot_response, guardrail_fired, risk_level, created_at, reviewed)

-- Disputes
disputes (case_id, order_id, dispute_type, escrow_amount, claim_photo_url, baseline_photo_url, seal_barcode_expected, seal_barcode_reported, status, resolved_at)

-- Quarantine log
quarantine_log (id, inventory_id, reason, severity, discrepancy_percent, quarantined_at, resolved_at, resolved_by)

-- Audit log (immutable)
audit_log (id, event_type, entity_id, actor_id, metadata_json, timestamp)
```

---

## 7. Important Business Logic

### Medicine Schedule Enforcement
- **OTC**: No prescription required. Any patient can purchase.
- **Schedule H**: Valid prescription upload mandatory. Pharmacist must verify before dispensing.
- **Schedule H1**: Prescription required **and** pharmacist must make a register entry. Strictly quantity-limited.
- **Schedule X**: Referenced in audit types but not available for purchase — legal review required before enabling.

### Escrow Flow
```
Patient pays → Funds held in escrow → Pharmacist accepts & dispenses →
Courier delivers → Patient confirms with OTP → Funds released to pharmacy

If dispute: Funds held → Admin reviews evidence → Refund OR release decided
```

### Order Reassignment Trigger
An order is queued for reassignment when any of these occur:
1. Pharmacist does not accept within **15 minutes** (SLA breach)
2. **Out-of-stock** discovered on physical pick
3. **Cold-chain breach** detected on temperature-sensitive medicines

Candidate hubs are scored by: distance (km) + stock availability + SLA minutes + `matchScore`.

### Quarantine Triggers
An inventory item is auto-quarantined when:
- `reportedPrice` deviates from `systemFloorPrice` by a configurable threshold (default: >5%)
- `lastHeartbeat` is stale beyond 1 hour
- Active batch recall notice received
- Hub SLA breach rate exceeds threshold
- CDSCO license expiry detected

### Pricing Model
- `mrpReference`: Government MRP ceiling — no pharmacy can charge above this.
- `startingPrice`: Platform floor price based on generic bioequivalent pricing.
- `discountedPrice`: Final patient-facing price (always ≤ MRP).
- `packagingTamperFee`: Per-order tamper-evident packaging fee.
- `platformConvenience`: MediWise platform fee.
- `genericSavings`: Amount saved vs. branded equivalent — displayed prominently to incentivize generic choice.

---

## 8. Known Issues

| ID | Issue | Severity | Status |
|----|-------|----------|--------|
| KI-001 | `mockData.ts` has no server-side validation — price fields are not range-checked | Medium | Open |
| KI-002 | `AuthView.tsx` is 51KB — needs to be split into sub-components | Medium | Open |
| KI-003 | Noor AI has no rate limiting — can be called infinitely in dev | High | Resolved (20 req/min per user on `/api/ai/chat`) |
| KI-004 | `AskNoorWidget` does not handle Gemini API errors gracefully — silently fails | High | Resolved (proxy errors show a user-facing recovery message) |
| KI-005 | `ReassignmentEngineView` countdown timer does not persist across role changes | Low | Open |
| KI-006 | No loading skeleton states in `MarketplaceView` — may cause layout shift when real API lands | Medium | Open |
| KI-007 | `GEMINI_API_KEY` path in `AskNoorWidget.tsx` — verify it routes through backend proxy, not directly from client | Critical | Resolved (widget uses `/api/ai/chat`; key is referenced only in `server/routes/ai.ts` and `server/routes/rx.ts`) |
| KI-008 | ABHA ID format validation is UI-only — no backend format enforcement yet | Medium | Resolved (Phase 3 validators on register) |

---

## 9. Future Roadmap

### Q4 2026 — Backend Foundation
- [ ] PostgreSQL schema setup with per-tenant migration scripts
- [ ] Express.js REST API implementation (all planned endpoints)
- [ ] JWT authentication with ABHA ID integration
- [ ] Gemini proxy endpoint with rate limiting
- [ ] Prescription OCR pipeline (Gemini multimodal)

### Q1 2027 — Payments & Compliance
- [ ] Razorpay/PayU escrow integration
- [ ] CDSCO Form 20B/21B digital filing hooks
- [ ] DISHA data privacy audit log
- [ ] Cold-chain IoT data ingestion

### Q2 2027 — Scale & Performance
- [ ] Real-time order tracking (WebSocket)
- [ ] PWA + service worker for offline resilience
- [ ] Multi-language support (Hindi, Tamil, Bengali)
- [ ] Mobile app (React Native) using shared type definitions

### Q3 2027 — AI & Analytics
- [ ] Predictive stock demand (Gemini + historical order data)
- [ ] Doctor portal with digital Rx issuance
- [ ] Analytics dashboard for hub operators
- [ ] Noor voice interface (Google Speech-to-Text)

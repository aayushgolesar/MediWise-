# 📦 MediWise — Changelog

All notable changes to the MediWise project are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/), and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

> **AI Note**: Update this file after every meaningful change. Include version bump, date, and categorized entries. Never overwrite existing entries — only append.

---

## [Unreleased]

> Changes that are staged or in progress for Phase 8.

---

## [2.1.0] — 2026-09-09

### Added

#### ⚡ Scale & Performance (Phase 7)
- **Real-Time Engine (Socket.IO)**:
  - Integrated `socket.io` server attached to Node HTTP server in `server/index.ts`.
  - Room-based order subscription channel (`joinOrderRoom`) and GPS telemetry broadcasts (`gps_update`, `order_updated`) in `src/realtime/websocketServer.ts`.
  - React `RealtimeProvider` and `useRealtime` hook in `src/realtime/RealtimeContext.tsx`.
  - Live real-time updates and active courier GPS positioning wired into `OrderTrackingView.tsx`.
- **Performance Optimization**:
  - Code splitting across all 10 `AppRole` views using `React.lazy` with `<Suspense>` fallback in `src/App.tsx`.
  - Image optimization utilities (`optimisedImgProps`, `webpSource`) in `src/utils/imageOptimizer.tsx`.
  - Redis caching layer (`ioredis`) with resilient in-memory fallback in `src/cache/redisClient.ts`.
  - 5-minute TTL caching on medicine catalog queries (`getMedicines`).
  - SQLite database indexes migration applied via `migrations/20260910_add_indexes.sql` on `orders(status)`, `orders(pharmacy_hub_id)`, `pharmacy_offers(medicine_id)`, `pharmacy_offers(hub_id)`, and `audit_log(entity_id, created_at)`.
- **Progressive Web App (PWA) & Offline Resilience**:
  - `vite-plugin-pwa` integration with automatic service worker precaching in `vite.config.ts`.
  - Web App Manifest configured with icons, standalone display mode, and theme color.
  - Dedicated offline fallback page in `public/offline.html` and styled React fallback component in `src/offline/OfflineFallback.tsx`.
  - Window `online` / `offline` event listeners in `src/App.tsx` for graceful connectivity degraded state.
- **Multi-Language (i18n)**:
  - Internationalization setup via `react-i18next` and `i18next` in `src/i18n/index.ts`.
  - Base translation sets for English (`en`), Hindi (`hi`), and Tamil (`ta`).
- **Cloud Deployment & CI/CD**:
  - Multi-stage production `Dockerfile` based on Node 20 Alpine.
  - Google Cloud Run service definition (`cloudrun.yaml`) with horizontal auto-scaling (1–10 instances).
  - GitHub Actions automated CI/CD pipeline (`.github/workflows/ci-cd.yml`) covering lint, unit/integration testing, container build, and Cloud Run deployment.
  - `"start:prod"` script in `package.json`.

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

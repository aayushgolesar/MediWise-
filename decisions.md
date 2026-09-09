# 📋 MediWise — Architecture & Product Decisions Log

> This file serves as the authoritative record of all important technical and product decisions made during the development of MediWise. Every AI assistant working on this codebase **must** read and respect this file before making architectural changes.

---

## Decision Index

| # | Decision Title | Date | Status |
|---|----------------|------|--------|
| D-001 | Adopt React + Vite + TypeScript as Core Frontend Stack | 2026-09-08 | ✅ Active |
| D-002 | Role-Based Single-Page Application Architecture | 2026-09-08 | ✅ Active |
| D-003 | Google Gemini API as the AI Engine for Noor | 2026-09-08 | ✅ Active |
| D-004 | TailwindCSS v4 for Styling | 2026-09-08 | ✅ Active |
| D-005 | Multi-Tenant Schema-Per-Hub Database Design | 2026-09-08 | ✅ Active |
| D-006 | Escrow-Based Payment Flow | 2026-09-08 | ✅ Active |
| D-007 | Mandatory Authentication Before App Access | 2026-09-08 | ✅ Active |
| D-008 | Mock Data Strategy for Frontend Development | 2026-09-08 | ✅ Active |
| D-009 | Express.js Backend for API Proxy | 2026-09-08 | ✅ Active |
| D-010 | CDSCO-Compliant Drug Schedule Enforcement | 2026-09-08 | ✅ Active |
| D-011 | Server-Side Gemini Proxy with OCR and Moderation | 2026-09-08 | ✅ Active |

---

## D-001 — Adopt React + Vite + TypeScript as Core Frontend Stack

| Field | Detail |
|-------|--------|
| **Date** | 2026-09-08 |
| **Status** | ✅ Active |

### Context / Problem
MediWise requires a performant, type-safe frontend capable of handling complex multi-role dashboards, real-time order tracking, AI chat integration, and regulatory compliance UI — all within a single cohesive application.

### Decision Taken
Use **React 19** with **Vite 6** as the build tool and **TypeScript 5.8** for type safety throughout the project.

### Reasoning
- React's component model maps cleanly to MediWise's role-based view architecture.
- Vite offers near-instant HMR and fast production builds.
- TypeScript eliminates entire classes of bugs in healthcare data handling (medicine types, order states, user roles).
- Strong ecosystem support for the chosen libraries (Lucide, Motion, Gemini SDK).

### Alternatives Considered
| Alternative | Reason Rejected |
|-------------|-----------------|
| Next.js | SSR complexity not needed for a role-gated SPA; added overhead without benefit |
| Create React App | Deprecated; slow build times; no longer maintained |
| Vue 3 + Vite | Smaller team familiarity; React ecosystem preferred |
| Angular | Too verbose for a startup-speed project |

### Impact on Project
- All components must be `.tsx` files.
- No `any` types unless explicitly justified and commented.
- `tsc --noEmit` must pass before any commit.

---

## D-002 — Role-Based Single-Page Application Architecture

| Field | Detail |
|-------|--------|
| **Date** | 2026-09-08 |
| **Status** | ✅ Active |

### Context / Problem
MediWise serves four distinct user personas — **Patient**, **Pharmacist**, **Admin**, and **OEM** — each requiring drastically different views and permissions.

### Decision Taken
Use a **single `AppRole` state** in `App.tsx` to conditionally render the correct view. No external router library is used.

### Reasoning
- Eliminates URL-based routing complexity for an auth-gated internal tool.
- State-driven rendering is simpler to reason about than URL guards.
- The app is not intended to be deep-linked by end users.

### Alternatives Considered
| Alternative | Reason Rejected |
|-------------|-----------------|
| React Router v6 | Overkill for state-driven views; adds bundle size |
| TanStack Router | Same reasoning; unnecessary complexity |
| Next.js App Router | SSR not required |

### Impact on Project
- All navigation must go through `setCurrentRole()` — never direct URL manipulation.
- `AppRole` type in `src/types/index.ts` is the single source of truth for all valid views.
- New views must be added as: (1) a value in `AppRole`, (2) a component in `src/components/`, (3) a conditional block in `App.tsx`.

---

## D-003 — Google Gemini API as the AI Engine for Noor

| Field | Detail |
|-------|--------|
| **Date** | 2026-09-08 |
| **Status** | ✅ Active |

### Context / Problem
MediWise requires an AI assistant ("Noor") that can answer patient queries about generic medicines, drug interactions, CDSCO schedules, and dosage guidance in real time.

### Decision Taken
Use **`@google/genai` SDK (v2.4+)** with the **Gemini API** (`GEMINI_API_KEY`) for all AI-powered features including Noor chat and Noor Moderation.

### Reasoning
- Gemini's medical reasoning capability is well-suited for pharma Q&A.
- The `@google/genai` SDK is already a project dependency.
- API key management is handled securely via environment variables — never exposed client-side in production.

### Alternatives Considered
| Alternative | Reason Rejected |
|-------------|-----------------|
| OpenAI GPT-4 | License cost, no existing integration |
| Anthropic Claude | No existing SDK setup |
| Local LLM (Ollama) | Cannot run on low-spec client machines reliably |

### Impact on Project
- `GEMINI_API_KEY` must **never** be embedded in client-side code or committed to Git.
- All Gemini API calls must route through the Express.js backend proxy.
- The AI system prompt must include CDSCO compliance disclaimers.

---

## D-004 — TailwindCSS v4 for Styling

| Field | Detail |
|-------|--------|
| **Date** | 2026-09-08 |
| **Status** | ✅ Active |

### Context / Problem
The project needs a consistent, rapid UI development system that supports dark-mode-first design and utility classes for a premium healthcare aesthetic.

### Decision Taken
Use **TailwindCSS v4** (`@tailwindcss/vite` plugin) integrated directly into the Vite pipeline.

### Reasoning
- Eliminates context-switching between CSS files and component files.
- v4's new oxide engine provides faster builds and smaller output.
- Dark-first (slate-900 base) design pattern is trivially implemented with Tailwind utilities.

### Alternatives Considered
| Alternative | Reason Rejected |
|-------------|-----------------|
| Vanilla CSS Modules | Slower development velocity for utility-heavy UI |
| Styled Components | Runtime overhead; not needed |
| Chakra UI | Opinionated components conflict with custom brand |

### Impact on Project
- No inline `style={}` props — use Tailwind utilities exclusively.
- Custom color palette is `emerald` (primary) + `slate` (backgrounds/text).
- No arbitrary CSS files should be added unless absolutely necessary.

---

## D-005 — Multi-Tenant Schema-Per-Hub Database Design

| Field | Detail |
|-------|--------|
| **Date** | 2026-09-08 |
| **Status** | ✅ Active |

### Context / Problem
Each pharmacy hub operates as a semi-independent tenant with its own inventory, orders, and licensing data. A single shared schema would create data isolation and performance issues at scale.

### Decision Taken
Implement a **schema-per-tenant** architecture where each pharmacy hub gets its own database schema identified by `schemaName` and `tenantId` (see `TenantHub` type).

### Reasoning
- Strong data isolation between competing pharmacies.
- Easier CDSCO and DISHA compliance — data segregation is auditable per hub.
- Scales horizontally without cross-tenant query contamination.

### Alternatives Considered
| Alternative | Reason Rejected |
|-------------|-----------------|
| Row-level isolation (single schema) | Too risky for competitor pharmacy data; hard to audit |
| Separate databases per tenant | Too expensive to manage at scale |

### Impact on Project
- The `SuperAdminView` must always show `schemaName` and `dbLatencyMs` per hub.
- All backend queries must be schema-aware — never use a global table without tenant context.
- `TenantHub` interface in `types/index.ts` is the authoritative shape for hub metadata.

---

## D-006 — Escrow-Based Payment Flow

| Field | Detail |
|-------|--------|
| **Date** | 2026-09-08 |
| **Status** | ✅ Active |

### Context / Problem
Medicine orders must protect both patients (from non-delivery or wrong dispensing) and pharmacies (from fraudulent chargebacks). A direct payment model has no consumer protection layer.

### Decision Taken
Implement an **escrow hold** at order placement. Funds are released to the pharmacy only after successful delivery confirmation (OTP-based). Disputes trigger a hold and investigation via `DisputeConsoleView`.

### Reasoning
- Protects patients from tampered or wrong medicines.
- Gives pharmacies financial certainty once OTP is confirmed.
- Aligns with digital healthcare best practices in regulated markets.

### Alternatives Considered
| Alternative | Reason Rejected |
|-------------|-----------------|
| Direct payment on order | No consumer protection; high chargeback risk |
| COD (Cash on Delivery) | Cannot enforce digital audit trail for Schedule H medicines |

### Impact on Project
- `OrderDetail.financials.escrowStatus` must always be displayed in `OrderTrackingView`.
- Dispute resolution must never auto-release escrow without pharmacist/admin sign-off.
- Payment states: `'Held in Escrow'` → `'Released to Pharmacy'` or `'Refunded'`.

---

## D-007 — Mandatory Authentication Before App Access

| Field | Detail |
|-------|--------|
| **Date** | 2026-09-08 |
| **Status** | ✅ Active |

### Context / Problem
MediWise handles Schedule H/H1 prescription medicines and patient health data. Unauthenticated access to any feature is a CDSCO and DISHA compliance violation.

### Decision Taken
`App.tsx` renders **only** `AuthView` when `currentUser === null`. No other component is accessible without authentication.

### Reasoning
- Prevents accidental exposure of patient or prescription data.
- Enforces role-based access at the earliest possible point.
- ABHA ID and pharmacist registration numbers are shown only after login.

### Alternatives Considered
| Alternative | Reason Rejected |
|-------------|-----------------|
| Route guards | Requires a router; SPA state check is simpler and equally secure |
| Optional auth (browse-first) | Violates CDSCO compliance for Rx medicine visibility |

### Impact on Project
- `currentUser` state must **never** be set without validated credentials.
- The auth toast must display the user's role on successful login.
- `handleSignOut()` must reset `currentUser` to `null` unconditionally.

---

## D-008 — Mock Data Strategy for Frontend Development

| Field | Detail |
|-------|--------|
| **Date** | 2026-09-08 |
| **Status** | ✅ Active |

### Context / Problem
Backend APIs are not yet production-ready. Frontend development must proceed in parallel without blocking on API availability.

### Decision Taken
All UI data is sourced from `src/data/mockData.ts` which exports typed mock arrays matching exact TypeScript interfaces in `src/types/index.ts`.

### Reasoning
- Enables full-fidelity UI development independent of backend.
- Mock data is typed — interface changes break both mock data and UI simultaneously, catching mismatches early.

### Alternatives Considered
| Alternative | Reason Rejected |
|-------------|-----------------|
| MSW (Mock Service Worker) | Overhead not justified for early-stage frontend |
| JSON Server | Adds a running process dependency |

### Impact on Project
- Mock data must always conform to interfaces in `src/types/index.ts`.
- When real APIs are integrated, `mockData.ts` imports must be replaced with API hooks — do not create parallel data flows.

---

## D-009 — Express.js Backend for API Proxy

| Field | Detail |
|-------|--------|
| **Date** | 2026-09-08 |
| **Status** | ✅ Active |

### Context / Problem
The Gemini API key must not be exposed in the browser bundle. A lightweight backend proxy is needed to forward AI requests securely.

### Decision Taken
Use **Express.js** (already a dependency) as the backend server to proxy Gemini API calls. The server reads `GEMINI_API_KEY` from environment variables server-side only.

### Reasoning
- Express is already in `package.json` — no new dependency needed.
- Minimal boilerplate for a proxy server.
- Keeps the Vite frontend and Express backend in the same monorepo.

### Alternatives Considered
| Alternative | Reason Rejected |
|-------------|-----------------|
| Vite proxy config | Cannot securely handle secret env vars in Vite's client-exposed config |
| Separate Node microservice | Too much operational overhead for a single proxy |

### Impact on Project
- `GEMINI_API_KEY` is **only** accessed in server-side code.
- Never import `process.env.GEMINI_API_KEY` in any `.tsx` or client-side `.ts` file.

---

## D-010 — CDSCO-Compliant Drug Schedule Enforcement

| Field | Detail |
|-------|--------|
| **Date** | 2026-09-08 |
| **Status** | ✅ Active |

### Context / Problem
Indian pharmaceutical regulations require that Schedule H medicines are only dispensed against a valid prescription, and Schedule H1 medicines require both prescription and pharmacist register entry.

### Decision Taken
The `Medicine.schedule` field enforces one of three values via TypeScript union types. UI and checkout logic gates dispensing based on this field.

### Reasoning
- Hardcoded enum prevents miscategorization at the data layer.
- Prescription audit (`PrescriptionAudit` interface) is always linked to Schedule H/H1 orders.
- OTC medicines bypass the Rx upload flow.

### Alternatives Considered
| Alternative | Reason Rejected |
|-------------|-----------------|
| Free-text schedule field | Too risky — typos could allow dispensing without Rx |
| Runtime validation only | TypeScript compile-time enforcement is stronger |

### Impact on Project
- Checkout must always validate `medicine.schedule` before processing.
- `PrescriptionAudit.scheduleCategory` must match the purchased medicine's schedule.
- Schedule X medicines are referenced in audits but not currently sold — add only after legal review.

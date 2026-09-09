# 📜 MediWise — AI Development Rules & Standards

> **MANDATORY**: Every AI coding assistant working on MediWise **must** read and follow these rules in their entirety before writing a single line of code. These rules exist to protect regulatory compliance, maintain code quality, and preserve the user experience.

---

## 1. Coding Standards

### 1.1 TypeScript Rules

```ts
// ✅ ALWAYS — use explicit types on function signatures
const getPharmacyOffers = (medicineId: string): PharmacyOffer[] => { ... }

// ❌ NEVER — use `any` without a comment explaining why
const data: any = response; // forbidden

// ✅ ALWAYS — use optional chaining and nullish coalescing
const name = user?.name ?? 'Unknown';

// ❌ NEVER — use non-null assertions without certainty
const name = user!.name; // avoid unless absolutely certain
```

- **No `any` types** unless explicitly justified with an inline comment.
- Use `unknown` instead of `any` for generic error or external data.
- All interfaces must live in `src/types/index.ts` — never define local interfaces in component files.
- Run `npm run lint` (`tsc --noEmit`) and ensure zero errors before committing.
- Use `React.FC<Props>` or explicit return type `JSX.Element` for all components.

### 1.2 React Component Rules

```tsx
// ✅ ALWAYS — Named exports for all components
export const MarketplaceView: React.FC<Props> = ({ ... }) => { ... }

// ❌ NEVER — Default exports inside component files (only App.tsx uses default export)
export default function MarketplaceView() { ... }
```

- **Functional components only** — no class components.
- Use `useState`, `useEffect`, `useCallback`, `useMemo` from React. No third-party state managers (Redux, Zustand) unless approved via a new `decisions.md` entry.
- Break components larger than **300 lines** into sub-components.
- All side effects in `useEffect` must have a cleanup function where applicable.
- Props must be defined as a named `interface` directly above the component.

### 1.3 General Code Quality

- **No commented-out code** in commits — use `git stash` or feature branches instead.
- Every function must have a **single responsibility** — if a function does more than one thing, split it.
- No `console.log` in production code. Use structured logging patterns on the backend.
- Magic numbers and strings must be extracted into named constants.

```ts
// ❌ NEVER
if (order.status === 5) { ... }

// ✅ ALWAYS
const ORDER_STATUS_DELIVERED = 'delivered';
if (order.status === ORDER_STATUS_DELIVERED) { ... }
```

---

## 2. Folder Structure Rules

```
MediWise-/
├── src/
│   ├── components/       # All React view components (one file per view)
│   ├── data/             # Mock data only (mockData.ts) — no business logic here
│   ├── types/            # TypeScript interfaces/types (index.ts only)
│   ├── App.tsx           # Root component — routing, auth state, global layout only
│   ├── main.tsx          # React entry point — do not add logic here
│   └── index.css         # Global styles — keep minimal, Tailwind handles most styling
├── public/               # Static assets only (favicon, images, fonts)
├── decisions.md          # AI context: all architectural decisions
├── rules.md              # AI context: this file
├── memory.md             # AI context: long-term project memory
├── changelog.md          # AI context: version history
├── .env                  # Local secrets — NEVER commit this file
├── .env.example          # Template for environment variables — always keep updated
└── vite.config.ts        # Vite configuration — do not modify without justification
```

### Folder Rules

- ✅ New **view components** go in `src/components/` — named `[FeatureName]View.tsx`.
- ✅ Reusable **UI primitives** (buttons, badges, modals) go in `src/components/ui/` (create this folder when needed).
- ✅ New **TypeScript types** go in `src/types/index.ts` — never create a separate `types.ts` in a component folder.
- ✅ New **utility functions** go in `src/utils/` (create this folder when needed).
- ❌ Do NOT create nested component folders — keep `src/components/` flat.
- ❌ Do NOT put API call logic in component files — extract to `src/api/` when backend integration begins.
- ❌ Do NOT add `.js` files — this is a TypeScript project.

---

## 3. Naming Conventions

### Files & Folders

| Item | Convention | Example |
|------|-----------|---------|
| React component files | `PascalCase.tsx` | `CheckoutView.tsx` |
| Utility/helper files | `camelCase.ts` | `formatCurrency.ts` |
| Type definition files | `index.ts` (flat) | `src/types/index.ts` |
| Data files | `camelCase.ts` | `mockData.ts` |
| CSS files | `camelCase.css` | `index.css` |
| Test files | `[component].test.tsx` | `CheckoutView.test.tsx` |

### Variables & Functions

| Item | Convention | Example |
|------|-----------|---------|
| React components | `PascalCase` | `MarketplaceView` |
| Hooks | `use` + `PascalCase` | `useOrderTracking` |
| Event handlers | `handle` + `PascalCase` | `handleSelectPharmacy` |
| Boolean state vars | `is`/`has`/`can` prefix | `isNoorChatOpen`, `hasVerifiedRx` |
| Constants | `UPPER_SNAKE_CASE` | `MEDICINES_CATALOG` |
| Interfaces | `PascalCase` | `PharmacyOffer`, `AuthUser` |
| Type aliases | `PascalCase` | `AppRole`, `UserRole` |
| Enum-like string literals | Descriptive full strings | `'Schedule H (Prescription Required)'` |

### Component Props Interfaces

```tsx
// ✅ ALWAYS — name props interface as [ComponentName]Props
interface CheckoutViewProps {
  selectedOffer: PharmacyOffer | null;
  packCount: number;
  onOrderPlaced: (orderId: string) => void;
}
```

---

## 4. UI/UX Consistency Rules

### 4.1 Color Palette (Non-Negotiable)

| Role | Tailwind Class | Usage |
|------|---------------|-------|
| Primary action | `bg-emerald-500` / `text-emerald-400` | Buttons, highlights, badges |
| Background (dark) | `bg-slate-900` / `bg-slate-950` | Page backgrounds, panels |
| Background (light) | `bg-slate-100` / `bg-white` | Light mode surfaces |
| Text primary | `text-slate-100` / `text-slate-900` | Main body text |
| Text muted | `text-slate-400` / `text-slate-500` | Secondary labels |
| Border | `border-slate-700` / `border-slate-200` | Card/panel borders |
| Danger/Error | `text-red-400` / `bg-red-500/10` | Errors, critical alerts |
| Warning | `text-amber-400` / `bg-amber-500/10` | Warnings, SLA breaches |
| Info | `text-blue-400` / `bg-blue-500/10` | Informational states |

### 4.2 Typography Rules

- Font family: system `sans` (from Tailwind `font-sans`) — no custom fonts without approval.
- Heading hierarchy: `text-2xl font-bold` → `text-xl font-semibold` → `text-base font-medium`.
- Never use `text-black` — always use `text-slate-900` for maximum contrast control.
- Truncate long text with `truncate` or `line-clamp-*` utilities — never let text overflow its container.

### 4.3 Component Consistency Rules

- All **primary buttons**: `bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-semibold transition`.
- All **cards/panels**: `bg-slate-800 border border-slate-700 rounded-2xl` (dark) or `bg-white border border-slate-200 rounded-2xl shadow-sm` (light).
- All **badges/tags**: `text-xs font-bold px-2 py-0.5 rounded uppercase tracking-wide`.
- All **inputs**: `bg-slate-700 border border-slate-600 rounded-xl text-slate-100 placeholder:text-slate-400 focus:ring-2 focus:ring-emerald-500`.
- Status indicators must use **consistent** color-coding: green=active/success, amber=warning/pending, red=critical/error, blue=info.
- All interactive elements must have hover **and** focus states — never style one without the other.
- Animations: use `transition`, `duration-200`, and `ease-in-out` for all hover effects.

### 4.4 Accessibility Rules

- All buttons must have descriptive text or `aria-label`.
- Interactive elements must be keyboard-navigable.
- All form inputs must have associated `<label>` elements.
- Color alone must never be the sole indicator of state — pair with icons or text.
- Minimum touch target size: `h-10 w-10` (40×40px).

---

## 5. Git Commit Rules

### Commit Message Format

```
<type>(<scope>): <short description>

[optional body — explain WHY, not WHAT]

[optional footer — breaking changes, issue references]
```

### Commit Types

| Type | When to Use |
|------|------------|
| `feat` | New feature or view added |
| `fix` | Bug fix |
| `refactor` | Code change with no behavior change |
| `style` | UI-only changes (Tailwind classes, spacing) |
| `chore` | Build process, dependency updates |
| `docs` | Documentation updates (`decisions.md`, `memory.md`, etc.) |
| `test` | Adding or updating tests |
| `perf` | Performance improvements |
| `sec` | Security patches |

### Commit Rules

```bash
# ✅ Good commits
feat(marketplace): add medicine search with schedule filter
fix(checkout): prevent escrow release without OTP confirmation
docs(decisions): add D-011 for notification system decision

# ❌ Bad commits
fix stuff
updated files
WIP
```

- Commits must be **atomic** — one logical change per commit.
- Commit messages must be in **imperative mood** ("add", "fix", "update" — not "added", "fixed").
- `main` / `master` branch must **never** receive direct pushes — use pull requests.
- Feature branches: `feature/[short-description]`
- Bug fix branches: `fix/[short-description]`
- All PRs must include a description referencing the relevant `decisions.md` entry (if applicable).

---

## 6. Security & Environment Variable Rules

### 6.1 Environment Variable Rules

```bash
# .env.example — always keep this updated
GEMINI_API_KEY="YOUR_GEMINI_API_KEY_HERE"
APP_URL="http://localhost:3000"
```

| Rule | Detail |
|------|--------|
| `.env` is gitignored | **Never** commit `.env` — it is in `.gitignore` |
| `.env.example` is committed | Always update when adding new env vars |
| API keys = server-side only | `GEMINI_API_KEY` must only be read in Express server files |
| No `VITE_` prefix for secrets | `VITE_` prefix exposes variables to the browser bundle |
| Validate on startup | Server must throw an error at startup if required env vars are missing |

```ts
// ✅ Server-side validation on startup
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
if (!GEMINI_API_KEY) {
  throw new Error('FATAL: GEMINI_API_KEY environment variable is not set.');
}
```

### 6.2 General Security Rules

- **Input validation**: All user inputs must be validated before processing — especially prescription file uploads.
- **ABHA IDs and Rx numbers** must never appear in browser URLs or query strings.
- **No hardcoded credentials** in any source file — ever.
- **CORS**: The Express server must only allow requests from the known `APP_URL` origin.
- **Rate limiting**: AI (Noor) endpoints must implement rate limiting to prevent abuse.
- **Audit logs**: All Schedule H/H1 dispensing events must generate an immutable audit log entry.
- **Cold-chain data**: Temperature sensor data (`coldChainVerified`) must never be mutated after order dispatch.

---

## 7. Preserve Existing Functionality

> **This is the most important rule.**

- ❌ **Never** remove, rename, or alter an existing component prop without updating **all** call sites.
- ❌ **Never** change a TypeScript interface field without updating all mock data and component usages.
- ❌ **Never** alter `AppRole` values without updating `App.tsx`, `Header.tsx`, and all navigation logic.
- ❌ **Never** change the authentication flow in `App.tsx` without a new `decisions.md` entry.
- ✅ When refactoring, ensure the UI renders identically to before — get explicit user approval for any visible changes.
- ✅ When adding a new `AppRole`, add it to the `Decision Index` in `decisions.md`.
- ✅ Always run `npm run lint` after changes to verify TypeScript integrity.
- ✅ Update `changelog.md` for every meaningful change — even internal refactors.

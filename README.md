# 🌿 MediWise — Generic Medicine Price Parity & Clearinghouse

MediWise is a full-stack, multi-tenant SaaS clearinghouse platform for CDSCO-regulated generic medicine price parity, prescription audit, and pharmacy fulfillment in India.

---

## 📁 Repository Structure

```
MediWise-/
├── frontend/                 # React 19 + Vite + TailwindCSS SPA
│   ├── src/                  # Components, views, i18n, and API client
│   ├── public/               # Manifest, PWA icons, offline assets
│   ├── package.json          # Frontend-only dependencies
│   ├── vite.config.ts        # Vite build & proxy configuration
│   └── .env.example          # Frontend environment variables
│
├── backend/                  # Express.js + SQLite + Socket.IO API Server
│   ├── src/                  # Routes, security, audit, database, and cache
│   ├── migrations/           # Database index and schema migrations
│   ├── tests/                # Vitest unit & integration test suites
│   ├── package.json          # Backend-only dependencies
│   └── .env.example          # Backend environment variables
│
├── package.json              # Monorepo orchestration scripts
└── README.md                 # Project documentation
```

---

## 🚀 Quick Start Guide

### 1. Install Dependencies

You can install all dependencies across root, backend, and frontend at once:

```bash
npm run install:all
```

Or install them individually:

```bash
# Backend dependencies
cd backend
npm install

# Frontend dependencies
cd ../frontend
npm install
```

---

### 2. Configure Environment Variables

#### Backend (`backend/.env`):
Create `backend/.env` (or copy from `backend/.env.example`):
```env
PORT=4000
APP_URL=http://localhost:3000
JWT_SECRET=mediwise_jwt_secret_dev_key_32_characters_minimum_ok!
DB_PATH=./mediwise.db
GEMINI_API_KEY=YOUR_GEMINI_API_KEY_HERE
REDIS_URL=redis://127.0.0.1:6379
```

#### Frontend (`frontend/.env`):
Create `frontend/.env` (or copy from `frontend/.env.example`):
```env
VITE_API_URL=http://localhost:4000
```

---

### 3. Seed the Database

Populate the local SQLite database with demo medicines, pharmacies, and users:

```bash
# From the project root:
npm run seed

# Or directly from backend/:
cd backend
npm run seed
```

---

### 4. Running the Application

#### Option A: Run Both Together (Recommended)
From the project root:
```bash
npm run dev
```
- **Frontend**: [http://localhost:3000](http://localhost:3000)
- **Backend API**: [http://localhost:4000](http://localhost:4000)
- **API Health**: [http://localhost:4000/api/health](http://localhost:4000/api/health)

#### Option B: Run Individually

**Start the Backend:**
```bash
cd backend
npm run dev
```

**Start the Frontend:**
```bash
cd frontend
npm run dev
```

---

## 🧪 Testing & Code Quality

### Backend Unit & Integration Tests (Vitest)
```bash
# From root:
npm run test

# Or from backend/:
cd backend
npm run test
npm run test:coverage
```

### TypeScript Validation (Lint)
```bash
# From root:
npm run lint

# Or individually:
cd backend && npm run lint
cd frontend && npm run lint
```

### Frontend Production Build
```bash
npm run build
```

---

## 🛡️ Regulatory Compliance Notice
MediWise adheres strictly to:
- **Drugs and Cosmetics Act, 1940 & Rules 1945**: Schedule H and Schedule H1 prescription audit verification.
- **CDSCO Gateway Standards**: Form 20B / Form 21B license checks for fulfillment hubs.
- **DISHA (Digital Information Security in Healthcare Act)**: Plaintext credentials and PHI access protection with immutable cryptographic audit logging.

# ── Stage 1: Build Vite frontend ───────────────────────────────────────────────
FROM node:20-alpine AS frontend-builder

WORKDIR /app/frontend

COPY frontend/package*.json ./
RUN npm ci

COPY frontend/ ./
RUN npm run build

# ── Stage 2: Production Node runtime ───────────────────────────────────────────
FROM node:20-alpine AS runner

WORKDIR /app

# Install backend production dependencies
COPY backend/package*.json ./backend/
WORKDIR /app/backend
RUN npm ci --omit=dev

WORKDIR /app
COPY backend/ ./backend/
COPY --from=frontend-builder /app/frontend/dist ./frontend/dist

# Expose port used by Cloud Run
ENV PORT=8080
ENV NODE_ENV=production
EXPOSE 8080

# Serve from backend
WORKDIR /app/backend
CMD ["node", "--loader", "tsx/esm", "src/index.ts"]

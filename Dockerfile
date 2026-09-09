# ── Stage 1: Build Vite frontend ───────────────────────────────────────────────
FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

# ── Stage 2: Production Node runtime ───────────────────────────────────────────
FROM node:20-alpine AS runner

WORKDIR /app

# Only install production deps
COPY package*.json ./
RUN npm ci --omit=dev

# Copy compiled server (tsx compiles on-the-fly via tsx, or use tsc)
COPY server/ ./server/
COPY --from=builder /app/dist ./dist

# Expose port used by Cloud Run
ENV PORT=8080
EXPOSE 8080

# Serve static files from dist/ and API from Express
CMD ["node", "--loader", "tsx/esm", "server/index.ts"]

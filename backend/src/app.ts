import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
import medicinesRouter from './routes/medicines.js';
import ordersRouter from './routes/orders.js';
import authRouter from './routes/auth.js';
import partnerRouter from './routes/partner.js';
import adminRouter from './routes/admin.js';
import aiRouter from './routes/ai.js';
import rxRouter from './routes/rx.js';
import paymentsRouter from './routes/payments.js';
import { requireCsrf } from './security.js';

export const createApp = (): express.Application => {
  const CLIENT_URL = process.env.APP_URL ?? 'http://localhost:3000';
  const app = express();

  // ─── Middleware ──────────────────────────────────────────────────────────────
  app.use(cors({ origin: CLIENT_URL, credentials: true }));
  app.use(express.json({ limit: '8mb' }));
  app.use(express.urlencoded({ extended: true }));

  app.use((_req, res, next) => {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'DENY');
    res.setHeader('Referrer-Policy', 'no-referrer');
    res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
    next();
  });

  const RATE_LIMIT_WINDOW_MS = 60_000;
  const RATE_LIMIT_MAX_REQUESTS = 240;
  const requestCounts = new Map<string, { count: number; resetAt: number }>();
  app.use((req, res, next) => {
    const key = req.ip ?? 'unknown';
    const now = Date.now();
    const bucket = requestCounts.get(key);
    if (!bucket || bucket.resetAt <= now) {
      requestCounts.set(key, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS });
      next();
      return;
    }
    if (bucket.count >= RATE_LIMIT_MAX_REQUESTS) {
      res.status(429).json({ error: 'Too many requests. Please try again shortly.' });
      return;
    }
    bucket.count += 1;
    next();
  });

  // CSRF double-submit protection for state-mutating requests
  app.use(requireCsrf);

  // ─── API Routes ──────────────────────────────────────────────────────────────
  app.use('/api/medicines', medicinesRouter);
  app.use('/api/orders', ordersRouter);
  app.use('/api/auth', authRouter);
  app.use('/api/partner', partnerRouter);
  app.use('/api/admin', adminRouter);
  app.use('/api/ai', aiRouter);
  app.use('/api/rx', rxRouter);
  app.use('/api/payments', paymentsRouter);

  // ─── Health Check ────────────────────────────────────────────────────────────
  app.get('/api/health', (_req, res) => {
    res.json({
      status: 'ok',
      service: 'MediWise API',
      version: '2.1.0',
      timestamp: new Date().toISOString(),
      geminiConfigured: Boolean(process.env.GEMINI_API_KEY),
    });
  });

  if (process.env.NODE_ENV === 'production') {
    // In Docker the frontend build is at /app/frontend/dist (two levels up from backend/src)
    const distPath = process.env.FRONTEND_DIST_PATH
      ?? path.resolve(__dirname, '../../frontend/dist');
    app.use(express.static(distPath));
    app.get('*', (req, res, next) => {
      if (req.path.startsWith('/api')) {
        next();
        return;
      }
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  // ─── 404 Handler ────────────────────────────────────────────────────────────
  app.use((_req, res) => {
    res.status(404).json({ error: 'Route not found' });
  });

  // ─── Global Error Handler ───────────────────────────────────────────────────
  app.use((err: Error, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
    res.status(500).json({ error: 'Internal server error', message: err.message });
  });

  return app;
};

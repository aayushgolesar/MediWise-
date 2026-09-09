import dotenv from 'dotenv';
import { createApp } from './app.js';

dotenv.config();

if (!process.env.JWT_SECRET || process.env.JWT_SECRET.length < 32) {
  throw new Error('FATAL: JWT_SECRET must be set to at least 32 characters.');
}

// ─── Startup Validation ────────────────────────────────────────────────────────
if (!process.env.GEMINI_API_KEY) {
  console.warn('⚠️  GEMINI_API_KEY is not set. Noor AI will run in dev-fallback mode (simulated responses).');
}

const PORT = Number(process.env.PORT ?? 4000);
const CLIENT_URL = process.env.APP_URL ?? 'http://localhost:3000';
const app = createApp();

// ─── Start ────────────────────────────────────────────────────────────────────
if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    console.log(`\n🚀 MediWise API running at http://localhost:${PORT}`);
    console.log(`   Health check: http://localhost:${PORT}/api/health`);
    console.log(`   CORS allowed: ${CLIENT_URL}`);
    console.log(`   Gemini AI:    ${process.env.GEMINI_API_KEY ? '✅ Configured' : '⚠️  Dev fallback mode'}\n`);
  });
}

export default app;

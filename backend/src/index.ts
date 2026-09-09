import { createServer } from 'http';
import { Server } from 'socket.io';
import { createApp } from './app.js';
import { initRealtime } from './realtime.js';
import { connectDB } from './db.js';

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
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: CLIENT_URL,
    methods: ['GET', 'POST']
  }
});
initRealtime(io);

// ─── Start ────────────────────────────────────────────────────────────────────
if (process.env.NODE_ENV !== 'test') {
  const startServer = () => {
    httpServer.listen(PORT, '0.0.0.0', () => {
      console.log(`\n🚀 MediWise API running at http://localhost:${PORT}`);
      console.log(`   Health check: http://localhost:${PORT}/api/health`);
      console.log(`   CORS allowed: ${CLIENT_URL}`);
      console.log(`   Gemini AI:    ${process.env.GEMINI_API_KEY ? '✅ Configured' : '⚠️  Dev fallback mode'}\n`);
    });
  };

  // Try to connect to MongoDB, but start server anyway
  void connectDB().then(() => {
    console.log('✅ MongoDB connected successfully');
    startServer();
  }).catch((error: unknown) => {
    console.error('❌ Failed to connect to MongoDB Atlas');
    console.error('Error details:', error instanceof Error ? error.message : String(error));
    console.error('\nPossible causes:');
    console.error('1. MONGODB_URI environment variable not set on Render');
    console.error('2. Render IP not whitelisted in MongoDB Atlas Network Access');
    console.error('3. MongoDB credentials are incorrect');
    console.error('4. Network connection timeout (check firewall)');
    console.error('\n⚠️  Starting server anyway - will retry MongoDB connection on first request');
    startServer();
  });
}

export { app, io };
export default httpServer;

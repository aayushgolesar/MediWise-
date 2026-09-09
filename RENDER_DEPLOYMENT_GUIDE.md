# MediWise - Render Deployment Guide

This guide explains how to deploy MediWise backend to Render (frontend is on Vercel).

## Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    Render (Backend)                      │
│  ┌─────────────────────────────────────────────────┐   │
│  │         MediWise API (Node.js/Express)          │   │
│  │  - MongoDB Atlas connection                     │   │
│  │  - Redis for caching                            │   │
│  │  - All routes (auth, orders, medicines, etc)   │   │
│  └─────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────┘
              ↓ HTTPS API calls ↓
┌─────────────────────────────────────────────────────────┐
│                  Vercel (Frontend)                       │
│  ┌─────────────────────────────────────────────────┐   │
│  │         MediWise React Application              │   │
│  │  - Patient & Pharmacist dashboards              │   │
│  │  - Admin console                                │   │
│  └─────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────┘
              ↓ External Services ↓
         ┌────────────────────────┐
         │  MongoDB Atlas Cloud   │
         │      (Database)        │
         └────────────────────────┘
         ┌────────────────────────┐
         │   Redis Cloud/Render   │
         │    (Cache/Session)     │
         └────────────────────────┘
```

## Deployment Steps

### Step 1: Create Render Web Service

1. Go to [Render Dashboard](https://dashboard.render.com)
2. Click **New +** → **Web Service**
3. Select your GitHub repository (MediWise-)
4. Configure:
   - **Name**: `mediwise-api`
   - **Environment**: `Node`
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm run start --prefix backend`
   - **Plan**: Standard ($7/month) or higher

### Step 2: Add Environment Variables

In Render dashboard, go to **Environment** and add these variables:

```
MONGODB_URI=mongodb+srv://aayushgolesar_db_user:0bBZOFfNg6zVqHrp@cluster0.xyejzta.mongodb.net/?appName=Cluster0
MONGODB_DB_NAME=mediwise
JWT_SECRET=your-secure-32-character-secret-key-here
NODE_ENV=production
PORT=4000
APP_URL=https://your-frontend-url.vercel.app
REDIS_URL=redis://default:your-password@your-redis.render.com:6379
GEMINI_API_KEY=your-google-gemini-api-key
```

### Step 3: Configure MongoDB Atlas IP Whitelist

Your Render IP needs to be whitelisted in MongoDB Atlas:

1. Go to [MongoDB Atlas](https://cloud.mongodb.com) → Your Cluster
2. Security → Network Access
3. Click "Add IP Address"
4. Enter Render IP (you'll see it in deployment logs) or use `0.0.0.0/0` for testing
5. Click Confirm

**To find Render's IP:**
- Deploy first (it will fail due to IP whitelist)
- Check deployment logs for the error showing Render's IP
- Add that IP to MongoDB Atlas
- Redeploy

### Step 4: Set Up Redis (Optional but Recommended)

For caching and sessions:

**Option A: Render Redis Add-on**
1. In your service settings → Add-ons
2. Click **Create a Database**
3. Select **Redis**
4. Copy the connection string
5. Add to environment variables as `REDIS_URL`

**Option B: External Redis Provider**
- [Redis Cloud](https://redis.com/try-free/)
- [Upstash Redis](https://upstash.com/)

### Step 5: Deploy

1. Render will auto-deploy when you push to GitHub's main branch
2. Or manually trigger: Dashboard → Deploys → Trigger Deploy
3. Check deployment logs for errors

## Monitoring Deployment

### View Logs
```bash
Render Dashboard → Your Service → Logs
```

### Test Health Endpoint
```bash
curl https://your-service-name.onrender.com/api/health
```

Should return:
```json
{
  "status": "ok",
  "service": "MediWise API",
  "version": "2.1.0",
  "timestamp": "2026-09-09T...",
  "geminiConfigured": true
}
```

### Test Database Connection
The backend will log connection status:
```
✅ Connected to MongoDB Atlas
✅ Redis cache available
✅ Server listening on port 4000
```

## Troubleshooting

### Build Fails: "Missing script: build"
✅ **Fixed**: Updated root `package.json` with proper build script that installs backend dependencies.

### Connection Refused (MongoDB)
- Check MongoDB Atlas IP whitelist includes Render IP
- Verify `MONGODB_URI` is correct
- Check MongoDB credentials are valid

### Connection Refused (Redis)
- If using Render Redis add-on, it's automatically available
- If using external Redis, verify `REDIS_URL` is correct
- Check firewall isn't blocking connection

### Memory Issues
- Render Standard plan: 512MB RAM
- If tests/migration run out of memory, use Premium plan or run separately
- Don't run `npm run test` during deployment - tests may timeout

### Slow Deployment
- First deploy may take 2-3 minutes
- Subsequent deploys are faster
- If stuck, check logs for network timeouts

## Post-Deployment

### Run Migration Script (One-time)

After confirming backend is running, you can run the SQLite→MongoDB migration:

```bash
# From your local machine:
npx tsx backend/src/migrate-sqlite-to-mongo.ts
```

This imports data from the local SQLite file into MongoDB Atlas.

### Update Frontend URL

In `backend/.env` and Render environment variables, set:
```
APP_URL=https://your-frontend-vercel-url.vercel.app
```

This ensures CORS works correctly between frontend (Vercel) and backend (Render).

## Environment Variables Reference

| Variable | Purpose | Example |
|----------|---------|---------|
| `MONGODB_URI` | MongoDB Atlas connection | `mongodb+srv://user:pass@cluster...` |
| `MONGODB_DB_NAME` | Database name | `mediwise` |
| `JWT_SECRET` | Session signing key | 32+ character string |
| `NODE_ENV` | Environment mode | `production` |
| `PORT` | Server port | `4000` |
| `APP_URL` | Frontend URL for CORS | `https://frontend.vercel.app` |
| `REDIS_URL` | Redis cache connection | `redis://default:pass@host:6379` |
| `GEMINI_API_KEY` | Google AI API key | Your Gemini API key |

## Performance Tips

1. **Enable Redis**: Dramatically speeds up catalog queries
2. **Database Indexes**: Already created via migrations
3. **API Caching**: Medicine catalog cached for 60 seconds
4. **Monitor Logs**: Watch for slow queries in production logs

## Scaling

As traffic grows:

1. **Upgrade Render Plan**: Standard → Professional → Business
2. **MongoDB Scaling**: Upgrade cluster tier in Atlas
3. **Redis Scaling**: Use larger Redis instance
4. **CDN**: Add Cloudflare for static assets
5. **Load Balancing**: Render handles automatically with higher plans

## Support

For issues:
- Check Render logs: Dashboard → Logs
- Check MongoDB Atlas: Cluster → Logs
- Check Redis: Redis dashboard logs (if applicable)
- Review network errors in browser DevTools

---

**Deployed Backend**: `https://your-service-name.onrender.com`
**Deployed Frontend**: Your Vercel URL
**Database**: MongoDB Atlas (cluster0)
**Cache**: Render Redis (if enabled)

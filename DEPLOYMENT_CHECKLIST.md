# MediWise Deployment Checklist

## ✅ What's Been Fixed

- [x] Root `package.json` now has proper `build` script for monorepo
- [x] Backend `package.json` now has `build` script (TypeScript type check)
- [x] Created `render.yaml` for Render deployment configuration
- [x] Created `RENDER_DEPLOYMENT_GUIDE.md` with step-by-step instructions
- [x] MongoDB migration script created and ready to use
- [x] All 14 Mongoose models implemented
- [x] All 8 API routes updated to use MongoDB
- [x] Created medicines.ts route file

## 🚀 Next Steps to Deploy

### Step 1: Connect GitHub to Render
1. Go to https://dashboard.render.com
2. Click "New +" → "Web Service"
3. Select your GitHub repo: `aayushgolesar/MediWise-`
4. Render will auto-detect the monorepo structure

### Step 2: Configure Build & Start Commands
Render should auto-detect these, but verify in your service settings:
- **Build Command**: `npm install && npm run build`
- **Start Command**: `npm run start --prefix backend`

### Step 3: Add Environment Variables
Click **Environment** tab and add these 8 variables:

```
MONGODB_URI=mongodb+srv://aayushgolesar_db_user:0bBZOFfNg6zVqHrp@cluster0.xyejzta.mongodb.net/?appName=Cluster0
MONGODB_DB_NAME=mediwise
JWT_SECRET=mediwise_local_development_secret_32_characters_minimum
NODE_ENV=production
PORT=4000
APP_URL=https://your-frontend-vercel-url.vercel.app
REDIS_URL=redis://default:password@your-redis-instance:6379
GEMINI_API_KEY=your-gemini-api-key-here
```

### Step 4: Add Render IP to MongoDB Atlas Whitelist
1. Deploy once (it will fail due to IP whitelist)
2. Check deployment logs for the error showing Render's IP
3. Go to MongoDB Atlas → Cluster → Security → Network Access
4. Add the Render IP (or `0.0.0.0/0` for testing)
5. Trigger redeploy in Render

### Step 5: Verify Deployment
Once backend is running on Render:

```bash
# Test health endpoint
curl https://your-render-service.onrender.com/api/health

# Should return:
{
  "status": "ok",
  "service": "MediWise API",
  "version": "2.1.0",
  "timestamp": "...",
  "geminiConfigured": true/false
}
```

### Step 6: Update Frontend CORS
In Vercel (frontend):
1. Add backend URL to environment variables
2. Update API baseURL to point to Render backend
3. Redeploy frontend

## 📋 Render Service Configuration

```
Service Name: mediwise-api
Environment: Node
Region: Your choice (US-East recommended)
Build Command: npm install && npm run build
Start Command: npm run start --prefix backend
Health Check: GET /api/health
Instance Type: Standard or higher
```

## 🔍 Troubleshooting During Deployment

### "Build failed - Missing script: build"
✅ **Fixed** - Root package.json now has proper build script

### "Cannot find module './routes/medicines.js'"
✅ **Fixed** - Created backend/src/routes/medicines.ts

### "Connection refused to MongoDB"
- Check MongoDB Atlas IP whitelist includes Render IP
- Verify `MONGODB_URI` environment variable is set correctly
- Check MongoDB credentials are valid

### "Port 4000 already in use"
- Render assigns PORT automatically
- Backend reads from `process.env.PORT`
- Should work out of the box

### "Deployment timeout"
- First deployment takes 2-3 minutes
- Check logs for network issues
- Verify npm packages are installing correctly

## 📊 Architecture After Deployment

```
User Browser (Vercel Frontend)
         ↓ HTTPS
    Vercel CDN
         ↓
  React Frontend App
         ↓ API Calls
    Render Backend API
         ↓ Mongoose
    MongoDB Atlas Database
         ↓ Cache
    Redis (Render add-on or external)
```

## 🎯 Success Indicators

- [x] Backend compiles without errors
- [ ] Tests pass (if running tests)
- [ ] Health endpoint returns 200 OK
- [ ] Frontend can call backend endpoints
- [ ] MongoDB stores/retrieves data
- [ ] User authentication works
- [ ] Orders can be placed

## 📱 Monitoring After Deployment

1. **Render Logs**: Dashboard → Your Service → Logs
2. **MongoDB Logs**: Atlas console → Cluster → Logs
3. **Error Tracking**: Set up Sentry or similar
4. **Performance**: Monitor response times in Render dashboard

## 🔄 Deployment Commands Reference

```bash
# Local development
npm run dev

# Build for production
npm run build

# Run backend only
npm run start:backend

# Run tests
npm run test

# Type check
npm run lint

# Database migration
npm run migrate:sqlite-to-mongo --prefix backend
```

## 📞 Support Resources

- Render Docs: https://render.com/docs
- MongoDB Atlas: https://cloud.mongodb.com
- Express.js: https://expressjs.com
- Mongoose: https://mongoosejs.com

---

**Status**: ✅ Ready for Render Deployment
**Frontend**: Deployed on Vercel
**Backend**: Ready to deploy on Render
**Database**: MongoDB Atlas (configured)

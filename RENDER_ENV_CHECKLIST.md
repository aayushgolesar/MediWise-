# Render Environment Variables Checklist

## Required Variables (8 Total)

Copy and verify each variable is set in Render Dashboard → Environment:

### ✅ Already Set (from screenshot)
- [x] `MONGODB_URI` = `mongodb+srv://aayushgolesar_db_user:0bBZOFfNg6zVqHrp@cluster0.xyejzta.mongodb.net/?appName=Cluster0`

### Still Need to Add

**#2. Database Configuration**
- [ ] `MONGODB_DB_NAME` = `mediwise`

**#3. Authentication & Security**
- [ ] `JWT_SECRET` = Use a secure 32+ character string (example below)
  ```
  mediwise_jwt_secret_key_production_2026_secure_32chars_min
  ```

**#4. Server Configuration**
- [ ] `NODE_ENV` = `production`
- [ ] `PORT` = `4000`

**#5. Frontend Configuration**
- [ ] `APP_URL` = Your Vercel frontend URL
  ```
  https://your-frontend-name.vercel.app
  ```
  (Replace with your actual Vercel URL)

**#6. Optional but Recommended**
- [ ] `REDIS_URL` = Redis connection string (if using Render Redis add-on)
  ```
  redis://default:password@your-redis-instance:6379
  ```

**#7. Optional for AI Features**
- [ ] `GEMINI_API_KEY` = Your Google Gemini API key (if using Noor AI)
  ```
  (leave blank if not using AI features)
  ```

## How to Add Variables in Render

1. Go to **Render Dashboard** → Click your **mediwise-api** service
2. Click **Environment** tab
3. Click **+ Add Environment Variable**
4. Enter the variable name in left field
5. Enter the value in right field
6. Click the **+** button to add it
7. Repeat for each variable
8. Changes are auto-saved

## Summary Checklist

```
☐ MONGODB_URI                 ✅ Already set
☐ MONGODB_DB_NAME             📝 Need to add
☐ JWT_SECRET                  📝 Need to add
☐ NODE_ENV                    📝 Need to add
☐ PORT                        📝 Need to add
☐ APP_URL                     📝 Need to add
☐ REDIS_URL                   (optional)
☐ GEMINI_API_KEY              (optional)
```

## After Adding All Variables

1. All environment variables will be auto-saved
2. Render will **automatically redeploy** your service
3. Check **Logs** tab for deployment status
4. Look for success message:
   ```
   ✅ MongoDB connected: ac-mn3f8wx-shard-00-00.xyejzta.mongodb.net
   🚀 MediWise API running at http://localhost:4000
   ```

## Verify Deployment Success

Once redeployed, test with:
```bash
curl https://your-render-service-url.onrender.com/api/health
```

Should return:
```json
{
  "status": "ok",
  "service": "MediWise API",
  "version": "2.1.0",
  "timestamp": "2026-09-09T...",
  "geminiConfigured": false
}
```

---

**Status**: Waiting for you to add remaining 7 environment variables in Render dashboard

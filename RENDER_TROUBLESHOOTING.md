# Render Deployment Troubleshooting

## Build Succeeded but Start Failed (Exit Status 1)

### Error Message
```
==> Running 'npm run start'
> mediwise-backend@2.1.0 start
> node --use-system-ca --import tsx src/index.ts
==> Exited with status 1
```

### Most Likely Cause
**MongoDB connection failed** - The server cannot connect to MongoDB Atlas.

### Quick Fix Steps

#### Step 1: Check Environment Variables
In Render Dashboard → Your Service → Environment:

Verify these variables are set:
- ✅ `MONGODB_URI` - Your MongoDB Atlas connection string
- ✅ `MONGODB_DB_NAME` - Should be `mediwise`
- ✅ `JWT_SECRET` - At least 32 characters
- ✅ `NODE_ENV` - Should be `production`
- ✅ `PORT` - Should be `4000`
- ✅ `APP_URL` - Your Vercel frontend URL (e.g., https://mediwise.vercel.app)

**If any are missing, add them and trigger a redeploy.**

#### Step 2: Check MongoDB Atlas IP Whitelist

Your **Render IP must be whitelisted** in MongoDB Atlas:

1. Go to [MongoDB Atlas](https://cloud.mongodb.com)
2. Select your cluster → **Security** tab
3. Click **Network Access**
4. Look for entries in the whitelist

**If Render IP is not there:**
1. Click **Add IP Address**
2. Click **Add Current IP Address** (or manually add: check Render logs for the IP)
3. Alternative: Add `0.0.0.0/0` to allow all IPs (for testing only)
4. Click Confirm

#### Step 3: Find Render's IP Address

In Render logs, look for error messages showing connection attempts:

```
❌ Failed to connect to MongoDB Atlas
Error details: getaddrinfo ENOTFOUND ac-mn3f8wx-shard-00-00.xyejzta.mongodb.net
```

To see detailed logs:
1. Render Dashboard → Your Service
2. Click **Logs** tab
3. Look for the actual error message

#### Step 4: Verify MongoDB Credentials

Your `MONGODB_URI` should look like:
```
mongodb+srv://USERNAME:PASSWORD@cluster0.xxxxx.mongodb.net/?appName=Cluster0
```

**Check:**
- Username/password are correct
- No special characters in password (if so, URL-encode them)
- Connection string is copied exactly from MongoDB Atlas

### Common Errors & Fixes

#### Error: `MONGODB_URI environment variable is not set`
**Fix**: Add `MONGODB_URI` to Render environment variables

#### Error: `getaddrinfo ENOTFOUND ac-mn3f8wx-shard...`
**Fix**: Your Render IP is blocked by MongoDB Atlas firewall
- Add Render IP to MongoDB Atlas Network Access

#### Error: `authentication failed`
**Fix**: Credentials are wrong
- Copy exact `MONGODB_URI` from MongoDB Atlas → Connect → Connection String

#### Error: `Timeout (10000ms) connecting to MongoDB`
**Fix**: Network connectivity issue
- Check MongoDB Atlas IP whitelist includes Render IP
- Check firewall isn't blocking connection
- Try using `0.0.0.0/0` in MongoDB Atlas temporarily (for testing only)

#### Error: `JWT_SECRET must be set to at least 32 characters`
**Fix**: Add/update `JWT_SECRET` environment variable to be 32+ characters

### Step-by-Step Debugging

1. **Verify environment variables are set:**
   ```bash
   # In Render Dashboard, go to Environment tab
   # Copy-paste values to verify they're not empty
   ```

2. **Check MongoDB Atlas Network Access:**
   - MongoDB Atlas → Your Cluster → Security → Network Access
   - Look for your Render IP or `0.0.0.0/0`

3. **Trigger a manual deploy:**
   - Render Dashboard → Your Service → Manual Deploy
   - Wait for logs to appear
   - Look for connection error details

4. **Check connection string format:**
   - Should start with `mongodb+srv://`
   - Should include `@cluster0.xxxxx.mongodb.net`
   - Should have `?appName=Cluster0` at the end

### If Still Not Working

Try this temporary fix (for testing only):

1. **Add all IPs to MongoDB Atlas** (not recommended for production):
   - MongoDB Atlas → Network Access → Add IP Address
   - Enter `0.0.0.0/0`
   - Click Confirm
   - Render will redeploy automatically

2. **Check if connection works locally:**
   ```bash
   # From your machine
   npx tsx -e "
   import mongoose from 'mongoose';
   await mongoose.connect('YOUR_MONGODB_URI');
   console.log('Connected!');
   process.exit(0);
   "
   ```

3. **Increase timeout in db.ts** (temporary):
   - Change `serverSelectionTimeoutMS: 10_000` to `30_000` (30 seconds)
   - This gives more time for connection to establish

### Success Indicators

After fixing, you should see in logs:
```
✅ MongoDB connected: ac-mn3f8wx-shard-00-00.xyejzta.mongodb.net

🚀 MediWise API running at http://localhost:4000
   Health check: http://localhost:4000/api/health
   CORS allowed: https://your-frontend.vercel.app
```

### Test Connection After Deploy

Once deployed successfully:

```bash
curl https://your-render-service.onrender.com/api/health
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

## Other Deployment Issues

### Port Already in Use
- Render assigns PORT automatically
- Backend reads from `process.env.PORT`
- Should be fine if using `0.0.0.0` binding

### Build Failed - Missing Dependencies
- Render runs `npm install` before build
- Should install all backend dependencies
- Check `backend/package.json` has all required packages

### Health Check Timeout
- Render has built-in health check on `/api/health`
- If MongoDB connection takes too long, health check might timeout
- Increase `serverSelectionTimeoutMS` if needed

---

**Need help?** Check:
1. Render Logs: Dashboard → Logs tab
2. MongoDB Atlas: Cluster → Logs
3. Your MongoDB URI: Copy from Atlas console exactly
4. Environment Variables: All 8 required variables set

# MongoDB Atlas IP Whitelist Guide

## Why This Step is Important

Your Render backend needs permission to connect to MongoDB Atlas. Without whitelisting Render's IP address, the connection will be blocked and the server will fail to start.

## Step-by-Step: Add Render IP to MongoDB Atlas

### Method 1: Add Specific Render IP (Recommended)

#### Step 1: Find Your Render IP Address

The Render IP will appear in your deployment logs when it tries to connect:

1. Go to **Render Dashboard** → Your Service (**mediwise-api**)
2. Click **Logs** tab
3. Look for error message like:
   ```
   Failed to connect to MongoDB Atlas
   Error details: getaddrinfo ENOTFOUND ac-mn3f8wx-shard...
   ```
   OR connection attempt showing an IP like `203.0.113.42`

**Alternative**: If deployment hasn't started yet, you can use `0.0.0.0/0` (see Method 2 below)

#### Step 2: Add to MongoDB Atlas

1. Go to [MongoDB Atlas](https://cloud.mongodb.com)
2. Log in with your account
3. Click your **Cluster** (cluster0)
4. Go to **Security** tab → **Network Access**
5. Click **+ Add IP Address** button
6. In the popup:
   - Select **Add a different IP address** 
   - Paste your Render IP (e.g., `203.0.113.42`)
   - Comment: `Render backend deployment`
7. Click **Confirm**
8. Wait 1-2 minutes for changes to apply

**Success message**: "IP address added to the IP access list"

---

### Method 2: Temporary - Allow All IPs (For Testing)

⚠️ **WARNING**: Only use this for testing/development, NOT for production!

1. Go to [MongoDB Atlas](https://cloud.mongodb.com)
2. Click your **Cluster** → **Security** → **Network Access**
3. Click **+ Add IP Address**
4. In the popup:
   - Enter: `0.0.0.0/0`
   - Comment: `Allow all (testing only - change before production)`
5. Click **Confirm**
6. Wait 1-2 minutes

**This allows ANY IP to connect** - change back to specific IPs before going to production.

---

## Verify IP is Whitelisted

1. Go to MongoDB Atlas → Your Cluster → **Security** → **Network Access**
2. Look at the list - you should see:
   - ✅ Your specific Render IP, OR
   - ✅ `0.0.0.0/0` (if using method 2)

---

## How to Find Your Render IP If Not Visible in Logs

**Option A: Use a temporary allow-all rule**
1. Add `0.0.0.0/0` to MongoDB Atlas (Method 2 above)
2. Trigger a deploy on Render
3. Let it connect successfully
4. Check Render logs to see the actual IP it connected from
5. Go back to MongoDB Atlas and replace `0.0.0.0/0` with the specific IP

**Option B: Check Render documentation**
- Render doesn't have a fixed IP range
- Each deployment might use different IPs
- Best practice: Use `0.0.0.0/0` for testing, then specific IPs after you know them

**Option C: Contact Render support**
- Render can provide deployment IP information
- Check Render docs: https://render.com/docs/deploy-node-express-app

---

## After Adding IP to Whitelist

1. **Wait 1-2 minutes** for MongoDB Atlas to update
2. **Go to Render Dashboard** → Your Service
3. Click **Manual Deploy** to redeploy
4. **Check Logs** for success:
   ```
   ✅ MongoDB connected: ac-mn3f8wx-shard-00-00.xyejzta.mongodb.net
   🚀 MediWise API running at http://localhost:4000
   ```

---

## Troubleshooting

### Still Getting Connection Error After Adding IP?

1. **Verify IP was actually added**:
   - Go to MongoDB Atlas → Network Access
   - Look for the IP in the whitelist list
   - Make sure it's not in "pending" state

2. **Wait longer for changes to propagate**:
   - MongoDB takes 1-2 minutes to apply changes
   - Wait and retry

3. **Check if using `0.0.0.0/0`**:
   - If you added `0.0.0.0/0`, it should work immediately
   - Try deploying again after adding it

4. **Verify credentials are correct**:
   - Check `MONGODB_URI` in Render environment variables
   - Verify username and password in the URI

5. **Check Render logs for specific error**:
   - Go to Logs tab
   - Look for error message details
   - Common errors:
     - `ENOTFOUND` = DNS resolution issue (usually IP whitelist)
     - `ECONNREFUSED` = Connection blocked
     - `authentication failed` = Wrong password

---

## Current Status Checklist

- [ ] Located your Render IP address (or will use `0.0.0.0/0`)
- [ ] Went to MongoDB Atlas → Network Access
- [ ] Added IP to whitelist (specific IP or `0.0.0.0/0`)
- [ ] Waited 1-2 minutes for changes to apply
- [ ] Ready to redeploy on Render

---

## Security Notes

- ✅ **Production**: Use specific Render IP only (find it first, add it)
- ⚠️ **Testing**: Use `0.0.0.0/0` for quick setup, replace with specific IP after
- 🔒 **Best Practice**: Keep IP whitelist minimal, only add necessary IPs
- 📋 **Document**: Note which IPs are for what (Render, local dev machine, etc)

---

**Next Step**: After adding IP to whitelist, go to Task #3 (Trigger manual deploy on Render)

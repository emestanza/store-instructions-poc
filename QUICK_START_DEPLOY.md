# Quick Start: Deploy to Render.com (Free)

## 🚀 Deploy in 5 Minutes

### Step 1: Prepare Repository

```bash
cd /var/www/store-instructions-cms

# Initialize git (if not already done)
git init

# Add all files
git add .

# Commit
git commit -m "Ready for deployment"
```

### Step 2: Push to GitHub

```bash
# Create a new repository on GitHub: https://github.com/new
# Name it: store-instructions-cms

# Add remote and push
git remote add origin https://github.com/YOUR_USERNAME/store-instructions-cms.git
git branch -M main
git push -u origin main
```

### Step 3: Deploy on Render

1. **Go to Render Dashboard:** https://dashboard.render.com/
2. **Click "New +"** → Select **"Web Service"**
3. **Connect GitHub:**
   - Click "Connect account" if needed
   - Select your repository: `store-instructions-cms`
4. **Configure Service:**
   - **Name:** `store-instructions-cms` (or any name you prefer)
   - **Environment:** `Node`
   - **Branch:** `main`
   - **Root Directory:** (leave empty)
   - **Build Command:** `npm install && npm run build`
   - **Start Command:** `npm start`
5. **Add Environment Variables:**
   - Click "Advanced" → "Add Environment Variable"
   - Add: `NODE_ENV` = `production`
   - Add: `PORT` = `3000`
6. **Configure Persistent Disk:**
   - Scroll to "Disks" section
   - Click "Add Disk"
   - **Name:** `cms-data`
   - **Mount Path:** `/opt/render/project/src/data`
   - **Size:** `1 GB` (free tier)
7. **Select Plan:**
   - Choose **"Free"** plan
8. **Click "Create Web Service"**

### Step 4: Wait for Deployment (2-3 minutes)

Watch the logs in Render dashboard. You'll see:
```
==> Building...
==> Installing dependencies...
==> Building TypeScript...
==> Starting application...
Connected to SQLite database
Server running on port 3000
```

### Step 5: Get Your URL

Your app will be available at:
```
https://store-instructions-cms.onrender.com
```
(Replace with your actual service name)

### Step 6: Test the Deployment

```bash
# Test health endpoint
curl https://YOUR-SERVICE-NAME.onrender.com/health

# Expected response:
# {"status":"ok","timestamp":"2024-..."}

# Access admin UI
# Open in browser: https://YOUR-SERVICE-NAME.onrender.com
```

### Step 7: Update Mobile App

Update `/var/www/zubale-app/src/helpers/Constants.js`:

```javascript
// Find these lines and update:
API_STORE_INSTRUCTIONS_BASE_URL: 'https://YOUR-SERVICE-NAME.onrender.com'
```

Build and test your mobile app!

---

## ⚠️ Important Notes

### Free Tier Limitations:
- App **sleeps after 15 minutes** of inactivity
- **First request after sleep takes ~30 seconds** (cold start)
- Database is persistent (won't lose data)
- 750 hours/month free (enough for 24/7 if only service)

### To Keep App Awake (Optional):
Use a cron job or uptime monitor to ping every 10 minutes:
```bash
# UptimeRobot (free): https://uptimerobot.com
# Ping URL every 5 minutes: https://YOUR-SERVICE-NAME.onrender.com/health
```

---

## 🔧 Troubleshooting

### Build Fails
Check these in your `package.json`:
```json
{
  "scripts": {
    "build": "tsc",
    "start": "node dist/server.js"
  },
  "type": "module"
}
```

### Database Not Persisting
1. Go to Render dashboard
2. Click your service
3. Go to "Disks" tab
4. Verify disk is mounted at `/opt/render/project/src/data`
5. Check logs for database path

### App Crashes on Start
1. Check "Logs" tab in Render dashboard
2. Common issues:
   - Missing environment variables
   - TypeScript build errors
   - Module import errors (make sure `.js` extensions in imports)

---

## 📊 Monitor Your Deployment

### View Logs:
```
Render Dashboard → Your Service → Logs
```

### View Metrics:
```
Render Dashboard → Your Service → Metrics
```

### Redeploy:
```bash
# Make changes locally
git add .
git commit -m "Update"
git push

# Render auto-deploys on git push!
```

---

## 🎯 Next Steps

1. ✅ Create content in CMS admin UI
2. ✅ Test mobile API endpoint
3. ✅ Update mobile app with production URL
4. ✅ Test end-to-end flow
5. ⭐ Consider upgrading to paid tier ($7/mo) for:
   - No sleep
   - Faster response times
   - More disk space

---

## 🆘 Need Help?

**Render Support:**
- Docs: https://render.com/docs
- Community: https://community.render.com
- Status: https://status.render.com

**CMS Issues:**
- Check logs in Render dashboard
- Verify environment variables
- Test health endpoint
- Check database disk mount

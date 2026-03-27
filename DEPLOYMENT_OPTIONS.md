# Store Instructions CMS - Deployment Options

## Overview
The CMS is a **Node.js/Express backend** with **SQLite database** and **static frontend**. This requires a platform that supports server-side execution (NOT static-only hosts like Netlify's free tier).

## ⭐ Recommended Options (Free Tier Available)

### 1. **Render.com** (RECOMMENDED - Best Free Option)
**Perfect for this use case** - Full Node.js support, persistent disk, free tier

**Pros:**
- ✅ Free tier with 750 hours/month
- ✅ Persistent disk for SQLite database (512MB free)
- ✅ Built-in HTTPS
- ✅ Auto-deploy from GitHub
- ✅ Easy environment variables
- ✅ No credit card required

**Setup Steps:**

1. **Create `render.yaml` in project root:**
```yaml
services:
  - type: web
    name: store-instructions-cms
    env: node
    buildCommand: npm install && npm run build
    startCommand: npm start
    envVars:
      - key: PORT
        value: 3000
      - key: NODE_ENV
        value: production
    disk:
      name: cms-data
      mountPath: /opt/render/project/src/data
      sizeGB: 1
```

2. **Update database path for production:**
Create `.env.production`:
```env
DATABASE_PATH=/opt/render/project/src/data/store-instructions.db
PORT=3000
```

3. **Modify `src/db/database.ts` to use production path:**
```typescript
const dbPath = process.env.DATABASE_PATH || path.join(__dirname, '../../data/store-instructions.db')
```

4. **Deploy:**
   - Push to GitHub
   - Go to https://render.com
   - Click "New Web Service"
   - Connect your GitHub repo
   - Render will auto-detect and deploy

**Render Dashboard:** https://dashboard.render.com

**URL Format:** `https://store-instructions-cms.onrender.com`

---

### 2. **Railway.app** (Excellent Alternative)
Modern platform with great DX, generous free tier

**Pros:**
- ✅ $5 free credit monthly (enough for this app)
- ✅ Persistent storage for SQLite
- ✅ GitHub integration
- ✅ Automatic HTTPS
- ✅ Simple deployment

**Setup Steps:**

1. **Create `railway.json`:**
```json
{
  "$schema": "https://railway.app/railway.schema.json",
  "build": {
    "builder": "NIXPACKS"
  },
  "deploy": {
    "startCommand": "npm start",
    "restartPolicyType": "ON_FAILURE",
    "restartPolicyMaxRetries": 10
  }
}
```

2. **Deploy:**
   - Push to GitHub
   - Go to https://railway.app
   - Click "New Project" → "Deploy from GitHub"
   - Select your repo
   - Add environment variables
   - Deploy

**Railway Dashboard:** https://railway.app/dashboard

**URL Format:** `https://store-instructions-cms.up.railway.app`

---

### 3. **Fly.io** (Great for Global Distribution)
Edge deployment with free allowance

**Pros:**
- ✅ Free tier: 3 shared-cpu VMs with 256MB RAM
- ✅ Persistent volumes (3GB free)
- ✅ Global CDN
- ✅ Dockerfile-based (full control)

**Setup Steps:**

1. **Install Fly CLI:**
```bash
curl -L https://fly.io/install.sh | sh
```

2. **Create `Dockerfile`:**
```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .
RUN npm run build

ENV NODE_ENV=production
EXPOSE 3000

CMD ["npm", "start"]
```

3. **Create `.dockerignore`:**
```
node_modules
data
.env
*.md
.git
```

4. **Deploy:**
```bash
fly auth login
fly launch --name store-instructions-cms
fly volumes create cms_data --size 1
fly deploy
```

**Fly Dashboard:** https://fly.io/dashboard

**URL Format:** `https://store-instructions-cms.fly.dev`

---

### 4. **Glitch.com** (Quickest Setup)
Browser-based development with instant deployment

**Pros:**
- ✅ Completely free
- ✅ No credit card needed
- ✅ Built-in code editor
- ✅ Instant updates

**Cons:**
- ⚠️ App sleeps after 5 min inactivity (wakes on request)
- ⚠️ Limited to 4000 requests/hour
- ⚠️ Public code by default

**Setup:**
1. Go to https://glitch.com
2. Click "New Project" → "Import from GitHub"
3. Paste your GitHub repo URL
4. Edit `.env` in Glitch editor
5. App is live immediately

**URL Format:** `https://store-instructions-cms.glitch.me`

---

## ❌ Not Recommended

### Netlify / Vercel (Free Tier)
- **Issue:** Free tier is for static sites or serverless functions only
- **Problem:** SQLite requires persistent filesystem (not available in serverless)
- **Alternative:** Would need to migrate to cloud database (PostgreSQL, etc.)

---

## 🎯 Quick Comparison

| Platform | Free Tier | SQLite Support | Sleep Policy | Best For |
|----------|-----------|----------------|--------------|----------|
| **Render** | ✅ 750h/mo | ✅ Persistent disk | Sleeps after 15min | **BEST CHOICE** |
| **Railway** | ✅ $5/mo credit | ✅ Persistent volume | Always on | Production-ready |
| **Fly.io** | ✅ 3 VMs | ✅ Persistent volume | Always on | Global apps |
| **Glitch** | ✅ Unlimited | ⚠️ Temporary | Sleeps after 5min | Quick demos |
| Netlify | ❌ Static only | ❌ No | N/A | Not suitable |
| Vercel | ❌ Serverless | ❌ No | N/A | Not suitable |

---

## 📋 Pre-Deployment Checklist

Before deploying, ensure:

- [ ] `package.json` has `build` and `start` scripts
- [ ] Environment variables are configured
- [ ] Database initialization runs on first start
- [ ] Static files are served correctly
- [ ] CORS is configured for your mobile app domain
- [ ] Upload directory is writable
- [ ] Health check endpoint works (`/health`)

---

## 🚀 Recommended Deployment Flow

### For POC/Testing: Use Render (Free)

1. **Prepare the app:**
```bash
cd /var/www/store-instructions-cms
git init
git add .
git commit -m "Initial commit"
```

2. **Push to GitHub:**
```bash
# Create new repo on GitHub first
git remote add origin https://github.com/YOUR_USERNAME/store-instructions-cms.git
git branch -M main
git push -u origin main
```

3. **Deploy on Render:**
   - Go to https://dashboard.render.com
   - Click "New +" → "Web Service"
   - Connect GitHub and select your repo
   - Fill in:
     - **Name:** `store-instructions-cms`
     - **Environment:** `Node`
     - **Build Command:** `npm install && npm run build`
     - **Start Command:** `npm start`
     - **Plan:** Free
   - Click "Create Web Service"

4. **Wait 2-3 minutes** for deployment

5. **Test the deployment:**
```bash
# Test health endpoint
curl https://store-instructions-cms.onrender.com/health

# Test API
curl https://store-instructions-cms.onrender.com/api/stores
```

6. **Update mobile app Constants.js:**
```javascript
API_STORE_INSTRUCTIONS_BASE_URL: 'https://store-instructions-cms.onrender.com'
```

---

## 🔧 Production Considerations

If moving beyond POC:

1. **Use PostgreSQL instead of SQLite:**
   - Render/Railway/Fly all offer free PostgreSQL
   - Better for concurrent writes
   - More reliable for production

2. **Use cloud storage for uploads:**
   - AWS S3
   - Cloudinary
   - Cloudflare R2

3. **Add authentication:**
   - JWT tokens
   - API keys
   - OAuth

4. **Enable monitoring:**
   - Error tracking (Sentry)
   - Performance monitoring
   - Uptime checks

---

## 📞 Support Links

- **Render Docs:** https://render.com/docs
- **Railway Docs:** https://docs.railway.app
- **Fly.io Docs:** https://fly.io/docs
- **Glitch Docs:** https://glitch.com/help

---

## Next Steps

1. Choose a platform (Render recommended)
2. Create GitHub repository
3. Follow deployment steps
4. Update mobile app with production URL
5. Test end-to-end flow

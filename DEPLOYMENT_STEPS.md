# 🚀 Complete Deployment Guide - Render & Vercel

This guide will walk you through deploying your IoT Security System to production.

## 📋 Prerequisites Checklist

Before starting, make sure you have:
- ✅ GitHub repository pushed (https://github.com/akashkali/AI-BLOCKCHAIN)
- ✅ MongoDB Atlas account with database ready
- ✅ BSC Testnet wallet with test BNB
- ✅ Smart contract deployed on BSC Testnet
- ✅ All environment variables ready

---

## Part 1: Backend Deployment on Render

### Step 1: Create Render Account
1. Go to [render.com](https://render.com)
2. Click **"Get Started for Free"**
3. Sign up with your **GitHub account** (recommended)
4. Authorize Render to access your repositories

### Step 2: Create New Web Service
1. In Render dashboard, click **"New +"** button (top right)
2. Select **"Web Service"**
3. Click **"Connect account"** if not already connected
4. Select your repository: **`akashkali/AI-BLOCKCHAIN`**
5. Click **"Connect"**

### Step 3: Configure Service Settings

Fill in the following:

**Basic Settings:**
- **Name**: `iot-security-backend` (or your preferred name)
- **Region**: Choose closest to your users (e.g., `Oregon (US West)`)
- **Branch**: `main`
- **Root Directory**: `flask_app` ⚠️ **IMPORTANT: Set this!**
- **Runtime**: `Python 3`
- **Build Command**: `pip install -r requirements.txt`
- **Start Command**: `gunicorn app:app --worker-class eventlet -w 1 --bind 0.0.0.0:$PORT`

**Advanced Settings (Optional):**
- **Auto-Deploy**: `Yes` (deploys on every push to main)
- **Health Check Path**: `/api/health`

### Step 4: Add Environment Variables

Click on **"Environment"** tab and add these variables:

#### Required Environment Variables:

```env
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/IoTSecurityDB
API_KEY=your_secure_api_key_here
SECRET_KEY=your_jwt_secret_key_here
PRIVATE_KEY=your_bsc_wallet_private_key
WALLET_ADDRESS=your_bsc_wallet_address
CONTRACT_ADDRESS=your_deployed_contract_address
PORT=10000
```

#### Optional Environment Variables:

```env
ALLOWED_ORIGINS=https://your-frontend.vercel.app
FLASK_DEBUG=False
```

**Security Notes:**
- ✅ Mark as **Secret** (eye icon): `PRIVATE_KEY`, `SECRET_KEY`, `MONGO_URI`
- 🔒 Never commit these values to GitHub
- 🔑 Generate strong random values for `API_KEY` and `SECRET_KEY`

**How to Generate Keys:**
```python
# For SECRET_KEY (JWT signing)
import secrets
print(secrets.token_hex(32))

# For API_KEY
import secrets
print(secrets.token_urlsafe(32))
```

### Step 5: Deploy

1. Scroll down and click **"Create Web Service"**
2. Render will start building your application
3. Wait for deployment to complete (usually 3-5 minutes)
4. You'll see build logs in real-time

### Step 6: Get Your Backend URL

After successful deployment:
- Your backend URL will be: `https://iot-security-backend.onrender.com` (or your custom name)
- Test it: `https://your-app-name.onrender.com/api/health`
- Should return: `{"status": "healthy", "message": "IoT Security API is running"}`

**⚠️ Important Notes:**
- First deployment may take longer (5-10 minutes)
- Free tier apps spin down after 15 minutes of inactivity
- First request after spin-down takes ~30 seconds (cold start)
- Consider upgrading for production use

---

## Part 2: Frontend Deployment on Vercel

### Step 1: Create Vercel Account
1. Go to [vercel.com](https://vercel.com)
2. Click **"Sign Up"**
3. Sign up with your **GitHub account** (recommended)
4. Authorize Vercel to access your repositories

### Step 2: Import Project
1. In Vercel dashboard, click **"Add New..."** → **"Project"**
2. Find and select: **`akashkali/AI-BLOCKCHAIN`**
3. Click **"Import"**

### Step 3: Configure Project Settings

**Framework Preset:**
- Select: **"Create React App"** (or it auto-detects)

**Root Directory:**
- Click **"Edit"** next to Root Directory
- Set to: `iot-dashboard` ⚠️ **IMPORTANT!**
- Click **"Continue"**

**Build and Output Settings:**
- **Build Command**: `npm run build` (auto-filled)
- **Output Directory**: `build` (auto-filled)
- **Install Command**: `npm install` (auto-filled)

### Step 4: Add Environment Variables

Before deploying, add environment variables:

1. Expand **"Environment Variables"** section
2. Add these variables for **Production**, **Preview**, and **Development**:

```env
REACT_APP_API_URL=https://iot-security-backend.onrender.com
REACT_APP_API_KEY=your_api_key_here
```

**Important:**
- Replace `https://iot-security-backend.onrender.com` with your actual Render backend URL
- Use the **same** `API_KEY` value as in your Render backend
- Variables must start with `REACT_APP_` to be accessible in React

### Step 5: Deploy

1. Click **"Deploy"** button
2. Wait for build to complete (usually 2-3 minutes)
3. You'll see build progress in real-time

### Step 6: Get Your Frontend URL

After successful deployment:
- Your frontend URL will be: `https://your-project-name.vercel.app`
- Vercel automatically provides HTTPS
- You can add a custom domain later

---

## Part 3: Connect Frontend to Backend

### Step 1: Update Backend CORS

After getting your Vercel URL, update Render environment variables:

1. Go to Render dashboard → Your service → **Environment**
2. Add or update `ALLOWED_ORIGINS`:
   ```
   ALLOWED_ORIGINS=https://your-project-name.vercel.app
   ```
3. Click **"Save Changes"**
4. Render will automatically redeploy

### Step 2: Update Frontend API URL (if needed)

If you need to change the backend URL:
1. Go to Vercel dashboard → Your project → **Settings** → **Environment Variables**
2. Update `REACT_APP_API_URL` with correct backend URL
3. Click **"Save"**
4. Go to **Deployments** tab → Click **"Redeploy"** on latest deployment

### Step 3: Test the Connection

1. Open your Vercel frontend URL
2. Open browser DevTools (F12) → **Console** tab
3. Check for any connection errors
4. Try logging in or accessing the dashboard
5. Verify API calls are working

---

## Part 4: Post-Deployment Checklist

### ✅ Backend (Render)
- [ ] Backend URL is accessible
- [ ] `/api/health` endpoint returns success
- [ ] MongoDB connection is working (check Render logs)
- [ ] Environment variables are set correctly
- [ ] CORS is configured for frontend URL

### ✅ Frontend (Vercel)
- [ ] Frontend URL is accessible
- [ ] No console errors in browser
- [ ] Can connect to backend API
- [ ] Environment variables are set
- [ ] Login/authentication works

### ✅ Integration
- [ ] Frontend can make API calls to backend
- [ ] WebSocket connections work (if using real-time features)
- [ ] Data flows correctly between frontend and backend
- [ ] Blockchain integration works (if applicable)

---

## 🔧 Troubleshooting

### Backend Issues

**Problem: App crashes on startup**
- Check Render logs for errors
- Verify all environment variables are set
- Check MongoDB connection string format
- Ensure `PORT` environment variable is set

**Problem: MongoDB connection fails**
- Verify `MONGO_URI` is correct
- Check MongoDB Atlas Network Access (allow 0.0.0.0/0 for Render)
- Verify database user credentials
- Check MongoDB Atlas logs

**Problem: CORS errors**
- Set `ALLOWED_ORIGINS` in Render environment variables
- Include your Vercel frontend URL
- Restart the service after updating

**Problem: WebSocket not working**
- Free tier has limited WebSocket support
- Check if `async_mode='eventlet'` is set in code
- Consider upgrading Render plan for production

### Frontend Issues

**Problem: Can't connect to backend**
- Verify `REACT_APP_API_URL` is correct in Vercel
- Check CORS settings in backend
- Verify backend is running (check Render dashboard)
- Check browser console for specific errors

**Problem: API key errors**
- Ensure `REACT_APP_API_KEY` matches backend `API_KEY`
- Verify environment variables are set for correct environment (Production/Preview)
- Redeploy after changing environment variables

**Problem: Build fails**
- Check Vercel build logs
- Verify `package.json` has correct build script
- Check for dependency issues
- Ensure `iot-dashboard` root directory is correct

---

## 📊 Monitoring

### Render Monitoring
- View logs: Dashboard → Your Service → **Logs** tab
- Monitor metrics: **Metrics** tab
- Check health: Visit `/api/health` endpoint

### Vercel Monitoring
- View build logs: Dashboard → Your Project → **Deployments**
- Check analytics: **Analytics** tab (if enabled)
- Monitor performance: **Speed Insights** (if enabled)

---

## 🔄 Updating Your Deployment

### Backend Updates
1. Push changes to GitHub `main` branch
2. Render auto-deploys (if auto-deploy is enabled)
3. Or manually deploy: Dashboard → **Manual Deploy**

### Frontend Updates
1. Push changes to GitHub `main` branch
2. Vercel auto-deploys
3. Or manually deploy: Dashboard → **Deployments** → **Redeploy**

---

## 🎉 Success!

Once everything is deployed and working:
- ✅ Backend: `https://your-backend.onrender.com`
- ✅ Frontend: `https://your-frontend.vercel.app`
- ✅ Both are connected and working together

Your IoT Security System is now live! 🚀

---

## 📞 Need Help?

- Render Support: [render.com/docs](https://render.com/docs)
- Vercel Support: [vercel.com/docs](https://vercel.com/docs)
- Check deployment logs for specific errors
- Review environment variables configuration


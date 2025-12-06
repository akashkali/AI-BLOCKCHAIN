# 🔧 Fix: Live Data Not Updating - Vercel Environment Variables

## Problem
Your frontend is trying to connect to `localhost:5000` instead of your Render backend, so live data is not updating.

## Solution: Set Environment Variables in Vercel

### Step 1: Go to Vercel Dashboard
1. Open [vercel.com](https://vercel.com)
2. Log in to your account
3. Click on your project

### Step 2: Add Environment Variables
1. Click on **"Settings"** tab (left sidebar)
2. Click on **"Environment Variables"** (in the left menu)
3. Click **"Add New"** button

### Step 3: Add REACT_APP_API_URL
**Name:**
```
REACT_APP_API_URL
```

**Value:**
```
https://ai-blockchain-03v4.onrender.com
```

**Environment:**
- ✅ Production
- ✅ Preview  
- ✅ Development

Click **"Save"**

### Step 4: Add REACT_APP_API_KEY
**Name:**
```
REACT_APP_API_KEY
```

**Value:**
```
[Same value as your Render API_KEY]
```

**Environment:**
- ✅ Production
- ✅ Preview
- ✅ Development

Click **"Save"**

### Step 5: Redeploy
1. Go to **"Deployments"** tab
2. Find the latest deployment
3. Click the **"..."** menu (three dots)
4. Click **"Redeploy"**
5. Wait for deployment to complete

## Important Notes

### Your Backend URL
Your Render backend is at: **`https://ai-blockchain-03v4.onrender.com`**

Make sure to use:
- ✅ `https://` (not `http://`)
- ✅ Full URL: `https://ai-blockchain-03v4.onrender.com` (no trailing slash)

### API Key
- The `REACT_APP_API_KEY` must be the **exact same value** as your `API_KEY` in Render
- Go to Render → Your Service → Environment → Find `API_KEY` → Copy the value
- Paste it in Vercel as `REACT_APP_API_KEY`

### After Setting Variables
1. **Redeploy** your Vercel app (important!)
2. Environment variables are only available after redeployment
3. Check browser console (F12) to verify it's connecting to the correct URL

## Verification

After redeploying, check:
1. Open your Vercel frontend URL
2. Open browser DevTools (F12) → **Console** tab
3. Look for API calls - they should go to `https://ai-blockchain-03v4.onrender.com`
4. Check for WebSocket connections - should connect to the same URL

## Troubleshooting

**Problem: Still connecting to localhost**
- Make sure you redeployed after setting environment variables
- Check that variable name is exactly: `REACT_APP_API_URL` (case-sensitive)
- Verify the value doesn't have extra spaces

**Problem: CORS errors**
- Go to Render → Your Service → Environment
- Add/update `ALLOWED_ORIGINS` with your Vercel URL:
  ```
  ALLOWED_ORIGINS=https://your-vercel-app.vercel.app
  ```
- Render will auto-redeploy

**Problem: API key errors**
- Verify `REACT_APP_API_KEY` in Vercel matches `API_KEY` in Render
- Both must be exactly the same value


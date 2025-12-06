# Render Deployment Guide

## Quick Setup Steps

### 1. Create Render Account
- Go to [render.com](https://render.com)
- Sign up with GitHub

### 2. Create New Web Service

1. Click **"New +"** → **"Web Service"**
2. Connect your GitHub repository
3. Select the repository

### 3. Configure Service

**Basic Settings:**
- **Name**: `iot-security-backend` (or your choice)
- **Region**: Choose closest to users
- **Branch**: `main`
- **Root Directory**: `flask_app`
- **Runtime**: `Python 3`
- **Build Command**: `pip install -r requirements.txt`
- **Start Command**: `gunicorn app:app --worker-class eventlet -w 1 --bind 0.0.0.0:$PORT`

### 4. Environment Variables

Add these in **Environment** tab:

```
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/IoTSecurityDB
API_KEY=your_api_key_here
SECRET_KEY=your_secret_key_here
PRIVATE_KEY=your_private_key_here
WALLET_ADDRESS=your_wallet_address_here
CONTRACT_ADDRESS=your_contract_address_here
ALLOWED_ORIGINS=https://your-frontend.vercel.app
PORT=10000
```

**Mark as Secret:**
- ✅ PRIVATE_KEY
- ✅ SECRET_KEY
- ✅ MONGO_URI

### 5. Deploy

Click **"Create Web Service"** and wait for deployment.

### 6. Get Your Backend URL

After deployment, your backend will be at:
`https://your-app-name.onrender.com`

---

## Important Notes

### WebSocket Support
- Free tier: Limited WebSocket support (connections may timeout)
- Paid tier: Full WebSocket support
- Consider upgrading for production

### Auto-Deploy
- Render auto-deploys on git push to main branch
- Manual deploy available in dashboard

### Logs
- View logs in Render dashboard
- Check for MongoDB connection errors
- Monitor API requests

### Health Check
Test your deployment:
```
https://your-app-name.onrender.com/api/health
```

---

## Troubleshooting

**Problem**: App crashes on startup
- Check environment variables are set
- Verify MongoDB connection string
- Check Render logs

**Problem**: WebSocket not working
- Free tier limitations
- Check async_mode='eventlet' in code
- Consider upgrading plan

**Problem**: CORS errors
- Set ALLOWED_ORIGINS environment variable
- Include your Vercel frontend URL



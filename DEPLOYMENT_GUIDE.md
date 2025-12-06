# Deployment Guide: Render (Backend) + Vercel (Frontend)

## 🚀 Backend Deployment on Render

### Step 1: Prepare Repository

1. Make sure your code is pushed to GitHub
2. Verify `flask_app/Procfile` exists
3. Verify `flask_app/requirements.txt` is up to date

### Step 2: Create Render Web Service

1. Go to [Render Dashboard](https://dashboard.render.com/)
2. Click **"New +"** → **"Web Service"**
3. Connect your GitHub repository
4. Configure the service:
   - **Name**: `iot-security-backend` (or your preferred name)
   - **Region**: Choose closest to your users
   - **Branch**: `main` (or your default branch)
   - **Root Directory**: `flask_app`
   - **Environment**: `Python 3`
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `gunicorn app:app --worker-class eventlet -w 1 --bind 0.0.0.0:$PORT`

### Step 3: Set Environment Variables in Render

Go to **Environment** tab and add:

```
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/IoTSecurityDB
API_KEY=your_api_key_here
SECRET_KEY=your_secret_key_here
PRIVATE_KEY=your_private_key_here
WALLET_ADDRESS=your_wallet_address_here
CONTRACT_ADDRESS=your_contract_address_here
PORT=10000
```

**Important:**
- Mark `PRIVATE_KEY` as **Secret**
- Mark `SECRET_KEY` as **Secret**
- Mark `MONGO_URI` as **Secret** (contains password)

### Step 4: Deploy

1. Click **"Create Web Service"**
2. Wait for deployment (5-10 minutes)
3. Your backend will be available at: `https://your-app-name.onrender.com`

### Step 5: Verify Deployment

1. Check health endpoint: `https://your-app-name.onrender.com/api/health`
2. Should return: `{"status": "healthy", ...}`

---

## 🎨 Frontend Deployment on Vercel

### Step 1: Prepare Frontend

1. Make sure frontend code is in GitHub
2. Verify `iot-dashboard/package.json` has build script:
   ```json
   "scripts": {
     "build": "react-scripts build"
   }
   ```

### Step 2: Create Vercel Project

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click **"Add New..."** → **"Project"**
3. Import your GitHub repository
4. Configure the project:
   - **Framework Preset**: `Create React App`
   - **Root Directory**: `iot-dashboard`
   - **Build Command**: `npm run build`
   - **Output Directory**: `build`

### Step 3: Set Environment Variables in Vercel

Go to **Settings** → **Environment Variables** and add:

```
REACT_APP_API_URL=https://your-app-name.onrender.com
REACT_APP_API_KEY=your_api_key_here
```

**Important:**
- Replace `your-app-name.onrender.com` with your actual Render backend URL
- Use the same `API_KEY` as in your backend

### Step 4: Deploy

1. Click **"Deploy"**
2. Wait for build (2-5 minutes)
3. Your frontend will be available at: `https://your-project.vercel.app`

### Step 5: Update CORS in Backend

Make sure your Render backend allows requests from Vercel domain:

In `flask_app/app.py`, the CORS is already configured:
```python
CORS(app)  # This allows all origins
```

For production, you might want to restrict it:
```python
CORS(app, origins=["https://your-project.vercel.app"])
```

---

## 🔧 Post-Deployment Configuration

### 1. Update Frontend Environment Variables

After backend is deployed, update Vercel environment variables:
- `REACT_APP_API_URL`: Your Render backend URL

### 2. Test the Connection

1. Open your Vercel frontend URL
2. Check browser console (F12) for any errors
3. Try logging in
4. Check if data loads correctly

### 3. WebSocket Configuration

For WebSocket to work on Render:
- Render supports WebSockets on paid plans
- Free tier has limitations (connections may timeout)
- Consider upgrading for production use

---

## 📝 Environment Variables Summary

### Backend (Render)
```
MONGO_URI=mongodb+srv://...
API_KEY=your_api_key
SECRET_KEY=your_secret_key
PRIVATE_KEY=your_private_key
WALLET_ADDRESS=your_wallet_address
CONTRACT_ADDRESS=your_contract_address
PORT=10000
```

### Frontend (Vercel)
```
REACT_APP_API_URL=https://your-backend.onrender.com
REACT_APP_API_KEY=your_api_key
```

---

## 🐛 Troubleshooting

### Backend Issues

**Problem**: App crashes on Render
- Check Render logs
- Verify all environment variables are set
- Check MongoDB connection string

**Problem**: WebSocket not working
- Free tier has limitations
- Check Render logs for connection errors
- Consider upgrading plan

### Frontend Issues

**Problem**: Can't connect to backend
- Verify `REACT_APP_API_URL` is correct
- Check CORS settings in backend
- Check browser console for errors

**Problem**: API key errors
- Verify `REACT_APP_API_KEY` matches backend
- Check environment variables in Vercel

---

## 🔒 Security Notes

1. **Never commit `.env` files** to GitHub
2. **Use environment variables** for all secrets
3. **Enable HTTPS** (automatic on Render/Vercel)
4. **Restrict CORS** in production if possible
5. **Use strong API keys** and secrets

---

## 📚 Additional Resources

- [Render Documentation](https://render.com/docs)
- [Vercel Documentation](https://vercel.com/docs)
- [Flask-SocketIO on Render](https://render.com/docs/deploy-flask-socketio)

---

## ✅ Deployment Checklist

### Backend (Render)
- [ ] Code pushed to GitHub
- [ ] Render service created
- [ ] Environment variables set
- [ ] Deployment successful
- [ ] Health endpoint working
- [ ] MongoDB connection verified

### Frontend (Vercel)
- [ ] Code pushed to GitHub
- [ ] Vercel project created
- [ ] Environment variables set
- [ ] Build successful
- [ ] Frontend accessible
- [ ] API connection working
- [ ] WebSocket connection working (if applicable)



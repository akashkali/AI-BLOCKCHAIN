# Quick Deployment Guide

## 🚀 Render (Backend) - 5 Minutes

1. Go to [render.com](https://render.com) → New Web Service
2. Connect GitHub repo
3. Settings:
   - Root Directory: `flask_app`
   - Build: `pip install -r requirements.txt`
   - Start: `gunicorn app:app --worker-class eventlet -w 1 --bind 0.0.0.0:$PORT`
4. Add Environment Variables:
   ```
   MONGO_URI=mongodb+srv://...
   API_KEY=your_key
   SECRET_KEY=your_secret
   PRIVATE_KEY=your_private_key
   WALLET_ADDRESS=your_wallet
   CONTRACT_ADDRESS=your_contract
   ALLOWED_ORIGINS=*
   PORT=10000
   ```
5. Deploy → Get URL: `https://your-app.onrender.com`

---

## 🎨 Vercel (Frontend) - 3 Minutes

1. Go to [vercel.com](https://vercel.com) → Add New Project
2. Import GitHub repo
3. Settings:
   - Root Directory: `iot-dashboard`
   - Framework: Create React App
4. Add Environment Variables:
   ```
   REACT_APP_API_URL=https://your-app.onrender.com
   REACT_APP_API_KEY=your_key
   ```
5. Deploy → Get URL: `https://your-project.vercel.app`

---

## 🔧 Final Step

Update Render `ALLOWED_ORIGINS`:
```
ALLOWED_ORIGINS=https://your-project.vercel.app
```

Done! ✅



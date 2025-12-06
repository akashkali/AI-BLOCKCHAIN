# Deployment Checklist

## ✅ Pre-Deployment Checklist

### Backend (Render)
- [ ] Code pushed to GitHub
- [ ] `flask_app/Procfile` exists and is correct
- [ ] `flask_app/requirements.txt` is up to date
- [ ] No hardcoded localhost URLs in code
- [ ] Environment variables documented in `.env.example`
- [ ] CORS configured to accept frontend URL
- [ ] PORT uses environment variable

### Frontend (Vercel)
- [ ] Code pushed to GitHub
- [ ] `iot-dashboard/package.json` has build script
- [ ] `iot-dashboard/vercel.json` configured
- [ ] No hardcoded localhost URLs in code
- [ ] All API calls use `REACT_APP_API_URL`
- [ ] API key uses `REACT_APP_API_KEY` environment variable
- [ ] WebSocket uses environment variable

---

## 🚀 Render Deployment Steps

1. [ ] Create Render account
2. [ ] Create new Web Service
3. [ ] Connect GitHub repository
4. [ ] Set Root Directory: `flask_app`
5. [ ] Set Build Command: `pip install -r requirements.txt`
6. [ ] Set Start Command: `gunicorn app:app --worker-class eventlet -w 1 --bind 0.0.0.0:$PORT`
7. [ ] Add environment variables:
   - [ ] MONGO_URI
   - [ ] API_KEY
   - [ ] SECRET_KEY
   - [ ] PRIVATE_KEY
   - [ ] WALLET_ADDRESS
   - [ ] CONTRACT_ADDRESS
   - [ ] ALLOWED_ORIGINS (your Vercel URL)
   - [ ] PORT=10000
8. [ ] Deploy service
9. [ ] Test health endpoint: `https://your-app.onrender.com/api/health`
10. [ ] Verify MongoDB connection in logs

---

## 🎨 Vercel Deployment Steps

1. [ ] Create Vercel account
2. [ ] Import GitHub repository
3. [ ] Set Root Directory: `iot-dashboard`
4. [ ] Set Framework: Create React App
5. [ ] Add environment variables:
   - [ ] REACT_APP_API_URL (your Render backend URL)
   - [ ] REACT_APP_API_KEY (same as backend)
6. [ ] Deploy
7. [ ] Test frontend URL
8. [ ] Verify API connection
9. [ ] Test login functionality
10. [ ] Check browser console for errors

---

## 🔧 Post-Deployment Configuration

### Update Backend CORS
1. [ ] Get your Vercel frontend URL
2. [ ] Update `ALLOWED_ORIGINS` in Render:
   ```
   ALLOWED_ORIGINS=https://your-project.vercel.app
   ```
3. [ ] Redeploy backend (or it will auto-update)

### Test Everything
1. [ ] Frontend loads correctly
2. [ ] API calls work
3. [ ] Login works
4. [ ] Dashboard loads data
5. [ ] WebSocket connections work (if applicable)
6. [ ] Real-time updates work

---

## 🐛 Common Issues & Fixes

### Backend Issues

**CORS Errors:**
- ✅ Fix: Set `ALLOWED_ORIGINS` in Render environment variables
- ✅ Include your Vercel URL

**MongoDB Connection Failed:**
- ✅ Check `MONGO_URI` is correct
- ✅ Verify MongoDB Atlas network access (IP whitelist)
- ✅ Check Render logs for connection errors

**WebSocket Not Working:**
- ✅ Free tier has limitations
- ✅ Check `async_mode='eventlet'` in code
- ✅ Consider upgrading Render plan

### Frontend Issues

**Can't Connect to Backend:**
- ✅ Verify `REACT_APP_API_URL` is correct
- ✅ Check CORS settings in backend
- ✅ Check browser console for errors

**API Key Errors:**
- ✅ Verify `REACT_APP_API_KEY` matches backend
- ✅ Check environment variables in Vercel

**Build Fails:**
- ✅ Check Vercel build logs
- ✅ Verify all dependencies in `package.json`
- ✅ Check for TypeScript/ESLint errors

---

## 📝 Environment Variables Reference

### Render (Backend)
```env
MONGO_URI=mongodb+srv://...
API_KEY=your_api_key
SECRET_KEY=your_secret_key
PRIVATE_KEY=your_private_key
WALLET_ADDRESS=your_wallet_address
CONTRACT_ADDRESS=your_contract_address
ALLOWED_ORIGINS=https://your-frontend.vercel.app
PORT=10000
```

### Vercel (Frontend)
```env
REACT_APP_API_URL=https://your-backend.onrender.com
REACT_APP_API_KEY=your_api_key
```

---

## ✅ Final Verification

After deployment, verify:

1. [ ] Backend health check works
2. [ ] Frontend loads without errors
3. [ ] API authentication works
4. [ ] Data loads correctly
5. [ ] Real-time updates work
6. [ ] No console errors
7. [ ] CORS headers correct
8. [ ] WebSocket connections stable

---

## 📚 Documentation Files

- `DEPLOYMENT_GUIDE.md` - Complete deployment guide
- `RENDER_DEPLOYMENT.md` - Render-specific guide
- `VERCEL_DEPLOYMENT.md` - Vercel-specific guide
- `flask_app/render.yaml` - Render configuration template



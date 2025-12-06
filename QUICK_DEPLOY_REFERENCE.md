# ⚡ Quick Deployment Reference

## 🔑 Environment Variables Quick Reference

### Render (Backend) - Required
```
MONGO_URI=mongodb+srv://user:pass@cluster.mongodb.net/IoTSecurityDB
API_KEY=generate_random_key
SECRET_KEY=generate_random_key_for_jwt
PRIVATE_KEY=your_bsc_private_key
WALLET_ADDRESS=your_bsc_wallet_address
CONTRACT_ADDRESS=your_contract_address
PORT=10000
ALLOWED_ORIGINS=https://your-frontend.vercel.app
```

### Vercel (Frontend) - Required
```
REACT_APP_API_URL=https://your-backend.onrender.com
REACT_APP_API_KEY=same_as_backend_api_key
```

## 📝 Deployment URLs Template

After deployment, fill these in:

**Backend (Render):**
- URL: `https://iot-security-backend.onrender.com`
- Health Check: `https://iot-security-backend.onrender.com/api/health`

**Frontend (Vercel):**
- URL: `https://your-project-name.vercel.app`

## 🔧 Quick Commands

### Generate Secure Keys (Python)
```python
import secrets
# For SECRET_KEY
print(secrets.token_hex(32))
# For API_KEY
print(secrets.token_urlsafe(32))
```

### Test Backend
```bash
curl https://your-backend.onrender.com/api/health
```

### Test Frontend Connection
Open browser console on frontend and check for API connection errors.

## ✅ Deployment Checklist

**Before Deploying:**
- [ ] MongoDB Atlas database ready
- [ ] BSC Testnet contract deployed
- [ ] All environment variables prepared
- [ ] GitHub repository pushed

**Render Setup:**
- [ ] Root Directory: `flask_app`
- [ ] Build Command: `pip install -r requirements.txt`
- [ ] Start Command: `gunicorn app:app --worker-class eventlet -w 1 --bind 0.0.0.0:$PORT`
- [ ] All environment variables added
- [ ] Secrets marked as secret

**Vercel Setup:**
- [ ] Root Directory: `iot-dashboard`
- [ ] Framework: Create React App
- [ ] Build Command: `npm run build`
- [ ] Output Directory: `build`
- [ ] Environment variables added

**After Deployment:**
- [ ] Backend health check works
- [ ] Frontend loads without errors
- [ ] CORS configured correctly
- [ ] API connection works
- [ ] Login/authentication works

## 🚨 Common Issues & Quick Fixes

| Issue | Quick Fix |
|-------|-----------|
| CORS errors | Add frontend URL to `ALLOWED_ORIGINS` in Render |
| MongoDB connection fails | Check Network Access in MongoDB Atlas (allow 0.0.0.0/0) |
| API key errors | Ensure same `API_KEY` in both Render and Vercel |
| Build fails | Check root directory is correct (`flask_app` or `iot-dashboard`) |
| 404 on routes | Check `vercel.json` routing configuration |

## 📞 Support Links

- **Render Docs**: https://render.com/docs
- **Vercel Docs**: https://vercel.com/docs
- **MongoDB Atlas**: https://www.mongodb.com/cloud/atlas
- **BSC Testnet**: https://testnet.bscscan.com


# Vercel Deployment Guide

## Quick Setup Steps

### 1. Create Vercel Account
- Go to [vercel.com](https://vercel.com)
- Sign up with GitHub

### 2. Import Project

1. Click **"Add New..."** → **"Project"**
2. Import your GitHub repository
3. Select the repository

### 3. Configure Project

**Build Settings:**
- **Framework Preset**: `Create React App`
- **Root Directory**: `iot-dashboard`
- **Build Command**: `npm run build`
- **Output Directory**: `build`
- **Install Command**: `npm install`

### 4. Environment Variables

Go to **Settings** → **Environment Variables**:

Add for **Production**, **Preview**, and **Development**:

```
REACT_APP_API_URL=https://your-backend.onrender.com
REACT_APP_API_KEY=your_api_key_here
```

**Important:**
- Replace `your-backend.onrender.com` with your actual Render backend URL
- Use the same `API_KEY` as in your backend

### 5. Deploy

Click **"Deploy"** and wait for build.

### 6. Get Your Frontend URL

After deployment, your frontend will be at:
`https://your-project.vercel.app`

---

## Post-Deployment

### 1. Update Backend CORS

In Render, update `ALLOWED_ORIGINS` environment variable:
```
ALLOWED_ORIGINS=https://your-project.vercel.app
```

### 2. Test Connection

1. Open your Vercel URL
2. Check browser console (F12)
3. Verify API calls work
4. Test login functionality

---

## Important Notes

### Environment Variables
- Must start with `REACT_APP_` to be accessible in React
- Changes require redeployment
- Can set different values for Production/Preview/Development

### Custom Domain
- Add custom domain in Vercel settings
- Update `ALLOWED_ORIGINS` in Render to include custom domain

### Build Optimization
- Vercel automatically optimizes React builds
- Static assets are CDN-cached
- API calls go to your Render backend

---

## Troubleshooting

**Problem**: Can't connect to backend
- Verify `REACT_APP_API_URL` is correct
- Check CORS settings in backend
- Check browser console for errors

**Problem**: API key errors
- Verify `REACT_APP_API_KEY` matches backend
- Check environment variables in Vercel dashboard

**Problem**: Build fails
- Check build logs in Vercel
- Verify `package.json` has build script
- Check for dependency issues



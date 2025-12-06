# 🔧 Fix: CORS Error and Authentication Failed

## Problem 1: CORS Error
```
https://ai-blockchain-hazel.vercel.app is not an accepted origin
```

## Problem 2: Authentication Failed
Login is not working because CORS is blocking the requests.

---

## Solution: Update Render Environment Variables

### Step 1: Fix CORS in Render

1. Go to **Render Dashboard** → Your Service (`iot-security-backend`)
2. Click on **"Environment"** tab
3. Find or add **`ALLOWED_ORIGINS`** environment variable
4. Set the value to:
   ```
   https://ai-blockchain-hazel.vercel.app
   ```
5. Click **"Save Changes"**
6. Render will automatically redeploy (wait 2-3 minutes)

### Step 2: Verify Environment Variables in Render

Make sure you have these set in Render:

✅ **ALLOWED_ORIGINS** = `https://ai-blockchain-hazel.vercel.app`  
✅ **API_KEY** = (your API key)  
✅ **SECRET_KEY** = (your JWT secret key)  
✅ **MONGO_URI** = (your MongoDB connection string)  
✅ **PRIVATE_KEY** = (your BSC wallet private key)  
✅ **WALLET_ADDRESS** = (your BSC wallet address)  
✅ **CONTRACT_ADDRESS** = (your contract address)  

### Step 3: Verify Vercel Environment Variables

Make sure you have these set in Vercel:

✅ **REACT_APP_API_URL** = `https://ai-blockchain-03v4.onrender.com`  
✅ **REACT_APP_API_KEY** = (same as Render API_KEY)  

### Step 4: Test After Redeploy

1. Wait for Render to finish redeploying (check Render logs)
2. Open your Vercel frontend: `https://ai-blockchain-hazel.vercel.app`
3. Try to login
4. Check browser console (F12) for any errors

---

## If Login Still Fails

### Check 1: Do you have a user account?

If you don't have a user account yet:

1. Try registering first:
   - Go to Register page
   - Create an account
   - Then try logging in

### Check 2: Check Render Logs

1. Go to Render Dashboard → Your Service → **"Logs"** tab
2. Try logging in from Vercel
3. Check the logs for:
   - Login requests
   - Any error messages
   - MongoDB connection issues

### Check 3: Verify MongoDB Connection

The login requires MongoDB. Check:
- Is MongoDB Atlas accessible?
- Is your IP whitelisted in MongoDB Atlas?
- Is `MONGO_URI` correct in Render?

### Check 4: Test Login Endpoint Directly

You can test the login API directly:

```bash
curl -X POST https://ai-blockchain-03v4.onrender.com/api/login \
  -H "Content-Type: application/json" \
  -d '{"email":"your-email@example.com","password":"your-password"}'
```

---

## Quick Fix Summary

**Most Important:**
1. ✅ Add `ALLOWED_ORIGINS=https://ai-blockchain-hazel.vercel.app` in Render
2. ✅ Wait for Render to redeploy
3. ✅ Try login again

The CORS error is blocking all API requests, including login. Once you fix CORS, authentication should work.


# 🔧 Fix Render Start Command

## Problem
Render is still using the old start command with `eventlet` even though we've updated the files.

## Solution: Update Start Command in Render Dashboard

### Step 1: Go to Render Dashboard
1. Open [render.com](https://render.com)
2. Log in to your account
3. Click on your service: **iot-security-backend**

### Step 2: Update Start Command
1. Click on **"Settings"** tab (left sidebar)
2. Scroll down to **"Build & Deploy"** section
3. Find **"Start Command"** field
4. **Delete** the old command:
   ```
   gunicorn app:app --worker-class eventlet -w 1 --bind 0.0.0.0:$PORT
   ```
5. **Replace** with:
   ```
   gunicorn app:app --threads 4 --bind 0.0.0.0:$PORT
   ```
6. Click **"Save Changes"**

### Step 3: Set Python Version (Important!)
1. Still in **"Settings"** → **"Build & Deploy"**
2. Find **"Python Version"** or **"Runtime"** field
3. Set it to: **`3.11.9`** or **`3.11`**
4. Click **"Save Changes"**

### Step 4: Redeploy
1. Go to **"Events"** or **"Manual Deploy"** tab
2. Click **"Manual Deploy"** → **"Deploy latest commit"**
3. Wait for deployment to complete

## Alternative: Delete and Recreate Service

If the above doesn't work, you can recreate the service:

1. **Note down all your environment variables** (copy them somewhere safe)
2. Delete the current service
3. Create a new Web Service
4. Connect the same GitHub repository
5. Set:
   - **Root Directory**: `flask_app`
   - **Start Command**: `gunicorn app:app --threads 4 --bind 0.0.0.0:$PORT`
   - **Python Version**: `3.11.9`
6. Add all environment variables back
7. Deploy

## Verification

After deployment, check the logs. You should see:
- ✅ No `eventlet` errors
- ✅ App starting with threading mode
- ✅ Successful deployment


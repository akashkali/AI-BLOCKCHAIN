# MongoDB Connection Setup Guide

## Issue: New data not showing after updating MONGO_URI

### Step 1: Verify .env File Location

The `.env` file should be in the **`flask_app`** folder (same directory as `app.py`).

**Correct location:**
```
flask_app/
  ├── .env          ← Should be here
  ├── app.py
  ├── requirements.txt
  └── ...
```

### Step 2: Update .env File

Your `.env` file should contain:

```env
MONGO_URI=mongodb+srv://akash:uBHnSwm02oEEkyt7@cluster0.xdfnm6g.mongodb.net/IoTSecurityDB
```

**Important Notes:**
- The connection string you provided: `mongodb+srv://akash:uBHnSwm02oEEkyt7@cluster0.xdfnm6g.mongodb.net/`
- **Add the database name** at the end: `/IoTSecurityDB`
- The full connection string should be: `mongodb+srv://akash:uBHnSwm02oEEkyt7@cluster0.xdfnm6g.mongodb.net/IoTSecurityDB`

### Step 3: Verify MongoDB Atlas Settings

1. **Network Access:**
   - Go to MongoDB Atlas → Network Access
   - Add your IP address OR allow access from anywhere (0.0.0.0/0) for testing
   - Click "Add IP Address"

2. **Database User:**
   - Verify the username: `akash`
   - Verify the password: `uBHnSwm02oEEkyt7`
   - Ensure the user has read/write permissions

3. **Database Name:**
   - The database name should be: `IoTSecurityDB`
   - If it doesn't exist, MongoDB will create it automatically

### Step 4: Test MongoDB Connection

Run the verification script:

```bash
cd flask_app
python verify_mongo.py
```

This will:
- Test the connection
- Show available collections
- Display document counts
- Show the latest record

### Step 5: Restart Flask Application

**IMPORTANT:** After updating `.env`, you MUST restart the Flask app:

1. **Stop the current Flask app** (Ctrl+C in terminal)

2. **Start it again:**
   ```bash
   cd flask_app
   python app.py
   ```

3. **Check the startup logs:**
   - You should see: `✅ MongoDB connection successful`
   - If you see an error, check the connection string

### Step 6: Verify Connection via API

After restarting, test the health endpoint:

```bash
curl http://localhost:5000/api/health
```

Or visit in browser: `http://localhost:5000/api/health`

Expected response:
```json
{
  "status": "healthy",
  "mongodb": {
    "connected": true,
    "database": {
      "database": "IoTSecurityDB",
      "collections": ["iot_data", "users", ...],
      "iot_data_count": 123
    }
  }
}
```

### Step 7: Check Frontend

1. **Hard refresh the browser:**
   - Windows/Linux: `Ctrl + Shift + R`
   - Mac: `Cmd + Shift + R`

2. **Click "Refresh Data" button** in the dashboard

3. **Check browser console** (F12) for any errors

### Troubleshooting

#### Issue: "MongoDB connection failed"

**Solutions:**
1. Check if `.env` file is in `flask_app` folder
2. Verify connection string format (no spaces, correct password)
3. Check MongoDB Atlas network access (IP whitelist)
4. Verify MongoDB Atlas cluster is running
5. Check if password has special characters that need URL encoding

#### Issue: "No data showing"

**Solutions:**
1. Restart Flask app after updating `.env`
2. Check if data exists in MongoDB Atlas:
   - Go to MongoDB Atlas → Collections
   - Verify `IoTSecurityDB` database exists
   - Check `iot_data` collection has documents
3. Run `python verify_mongo.py` to check data
4. Check Flask app logs for errors

#### Issue: "Connection timeout"

**Solutions:**
1. Check internet connection
2. Verify MongoDB Atlas cluster is not paused
3. Check firewall settings
4. Try connecting from MongoDB Atlas web interface

### Example .env File

```env
# MongoDB Connection
MONGO_URI=mongodb+srv://akash:uBHnSwm02oEEkyt7@cluster0.xdfnm6g.mongodb.net/IoTSecurityDB

# API Configuration
API_KEY=naanunainengamattannenginalthungamattan
SECRET_KEY=your-secret-key-here

# Blockchain Configuration
PRIVATE_KEY=your-private-key
WALLET_ADDRESS=your-wallet-address
CONTRACT_ADDRESS=your-contract-address
```

### Quick Checklist

- [ ] `.env` file is in `flask_app` folder
- [ ] `MONGO_URI` includes database name: `/IoTSecurityDB`
- [ ] MongoDB Atlas network access configured
- [ ] Flask app restarted after updating `.env`
- [ ] Connection verified with `python verify_mongo.py`
- [ ] Health endpoint returns "healthy"
- [ ] Browser cache cleared (hard refresh)




# GitHub Setup Guide

## Steps to Upload to GitHub

### 1. Clean Up Unwanted Files

Run the cleanup script:
```bash
python cleanup_for_github.py
```

Or manually remove these files:
- `app.log`
- `flask_app/flask_app.log`
- `untitled.py`
- `bonus.py`
- `flask_app/flask-backend/contract_abiii.json`
- `autoencoder_model.h5`
- `autoencoder_model.keras`
- `flask_app/models/autoencoder_model.keras`
- `synthetic_iot_dataset.csv`
- `Untitled.ipynb`, `Untitled1.ipynb`, `Untitled3.ipynb`
- `flask_app/Untitled.ipynb`

### 2. Verify .gitignore

The `.gitignore` file is already configured to exclude:
- Environment files (`.env`)
- Log files (`*.log`)
- Node modules (`node_modules/`)
- Build files (`iot-dashboard/build/`)
- Cache directories (`__pycache__/`, `cache/`, `artifacts/`)
- Large model files (`.h5`, `.keras`)
- CSV data files

### 3. Create .env.example File

Create a template for environment variables (without actual secrets):

```bash
# Create .env.example
cat > .env.example << 'EOF'
# MongoDB Connection
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/IoTSecurityDB

# API Configuration
API_KEY=your_api_key_here
SECRET_KEY=your_secret_key_here

# Blockchain Configuration
PRIVATE_KEY=your_private_key_here
WALLET_ADDRESS=your_wallet_address_here
CONTRACT_ADDRESS=your_contract_address_here

# API Endpoint (for simulator)
API_ENDPOINT=http://localhost:5000/predict_and_store
EOF
```

### 4. Initialize Git Repository

```bash
# Initialize git (if not already done)
git init

# Check what will be committed
git status

# Add all files
git add .

# Create initial commit
git commit -m "Initial commit: IoT Security System with Blockchain Integration"

# Add remote repository (replace with your GitHub repo URL)
git remote add origin https://github.com/yourusername/your-repo-name.git

# Push to GitHub
git branch -M main
git push -u origin main
```

### 5. Create a README.md

Make sure you have a good README.md file with:
- Project description
- Installation instructions
- Environment setup
- How to run the application
- API documentation

### 6. Important Notes

⚠️ **Before pushing, make sure:**
- No `.env` file is committed (check with `git status`)
- No API keys or passwords are in the code
- No large files (>100MB) are included
- Sensitive data is removed

### 7. Files That Should NOT Be Committed

- `.env` files (contains secrets)
- `*.log` files (log files)
- `node_modules/` (dependencies)
- `__pycache__/` (Python cache)
- `*.h5`, `*.keras` (large model files - removed from project)
- `*.csv` (large data files)
- Build artifacts

### 8. Files That SHOULD Be Committed

- Source code (`.py`, `.jsx`, `.js`)
- Configuration files (`requirements.txt`, `package.json`)
- Model files (`.pkl` - these are needed)
- Documentation (`.md` files)
- Contract ABIs (`contract_abi.json`)

## Quick Checklist

- [ ] Run `cleanup_for_github.py`
- [ ] Verify `.gitignore` is correct
- [ ] Create `.env.example` (template without secrets)
- [ ] Check `git status` - no `.env` or sensitive files
- [ ] Create/update `README.md`
- [ ] Initialize git and commit
- [ ] Push to GitHub

## After Uploading

1. Add a description to your GitHub repository
2. Add topics/tags (e.g., `iot`, `blockchain`, `flask`, `react`)
3. Create a `.env.example` file in the repo
4. Add installation instructions in README
5. Consider adding a LICENSE file



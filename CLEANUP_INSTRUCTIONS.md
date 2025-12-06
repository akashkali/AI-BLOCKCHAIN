# Cleanup Instructions for GitHub Upload

## Files to Remove Manually

Run these commands or delete manually:

### Log Files
```bash
del app.log
del flask_app\flask_app.log
```

### Temporary Files
```bash
del untitled.py
del bonus.py
del {
del 11.2.0
del npx
```

### Duplicate Files
```bash
del flask_app\flask-backend\contract_abiii.json
```

### Large Model Files (TensorFlow - removed from project)
```bash
del autoencoder_model.h5
del autoencoder_model.keras
del flask_app\models\autoencoder_model.keras
```

### Data Files
```bash
del synthetic_iot_dataset.csv
```

### Untitled Notebooks
```bash
del Untitled.ipynb
del Untitled1.ipynb
del Untitled3.ipynb
del flask_app\Untitled.ipynb
```

## Directories to Remove

```bash
rmdir /s /q cache
rmdir /s /q artifacts
rmdir /s /q __pycache__
rmdir /s /q flask_app\utils\__pycache__
rmdir /s /q iot-dashboard\build
rmdir /s /q iot-dashboard\node_modules
rmdir /s /q node_modules
```

## Or Use Python Script

```bash
python cleanup_for_github.py
```

## After Cleanup

1. Check git status: `git status`
2. Verify no .env file is tracked
3. Verify no log files are tracked
4. Add files: `git add .`
5. Commit: `git commit -m "Initial commit"`
6. Push: `git push`



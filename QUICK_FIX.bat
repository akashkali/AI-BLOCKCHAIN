@echo off
echo ========================================
echo Fixing Remaining Files
echo ========================================
echo.
echo This will:
echo 1. Delete flask_app.log (if Flask is stopped)
echo 2. Delete node_modules (if editors are closed)
echo.
pause

echo.
echo Attempting to delete flask_app\flask_app.log...
if exist "flask_app\flask_app.log" (
    del "flask_app\flask_app.log" 2>nul
    if %errorlevel% == 0 (
        echo [OK] flask_app.log deleted
    ) else (
        echo [WARNING] Could not delete flask_app.log - Flask app might be running
        echo           Stop Flask app (Ctrl+C) and try: del flask_app\flask_app.log
    )
) else (
    echo [OK] flask_app.log already deleted
)

echo.
echo Attempting to delete iot-dashboard\node_modules...
if exist "iot-dashboard\node_modules" (
    rmdir /s /q "iot-dashboard\node_modules" 2>nul
    if %errorlevel% == 0 (
        echo [OK] node_modules deleted
    ) else (
        echo [WARNING] Could not delete node_modules - files might be locked
        echo           Close VS Code/editors and try: rmdir /s /q iot-dashboard\node_modules
    )
) else (
    echo [OK] node_modules already deleted
)

echo.
echo ========================================
echo Done!
echo ========================================
echo.
echo Note: These files are already in .gitignore,
echo so they won't be committed to GitHub anyway.
echo.
pause



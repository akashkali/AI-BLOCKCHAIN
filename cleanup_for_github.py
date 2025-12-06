#!/usr/bin/env python3
"""
Script to clean up unwanted files before uploading to GitHub
"""
import os
import shutil
from pathlib import Path

# Files and directories to remove
FILES_TO_REMOVE = [
    # Log files
    "app.log",
    "flask_app/flask_app.log",
    
    # Temporary/untitled files
    "untitled.py",
    "bonus.py",
    "{",
    "11.2.0",
    "npx",
    
    # Duplicate files
    "flask_app/flask-backend/contract_abiii.json",
    
    # Large model files (TensorFlow - removed from project)
    "autoencoder_model.h5",
    "autoencoder_model.keras",
    "flask_app/models/autoencoder_model.keras",
    
    # Large data files
    "synthetic_iot_dataset.csv",
    
    # Untitled Jupyter notebooks
    "Untitled.ipynb",
    "Untitled1.ipynb",
    "Untitled3.ipynb",
    "flask_app/Untitled.ipynb",
]

DIRS_TO_REMOVE = [
    # Cache directories
    "cache",
    "artifacts",
    "__pycache__",
    "flask_app/utils/__pycache__",
    
    # Build directories
    "iot-dashboard/build",
    "iot-dashboard/node_modules",
    "node_modules",
    
    # Hardhat
    "ignition/deployments/chain-31337",
]

def cleanup():
    """Remove unwanted files and directories"""
    print("=" * 60)
    print("Cleaning up files for GitHub upload")
    print("=" * 60)
    
    removed_files = []
    removed_dirs = []
    errors = []
    
    # Remove files
    print("\n📄 Removing files...")
    for file_path in FILES_TO_REMOVE:
        if os.path.exists(file_path):
            try:
                # Try to close the file if it's open (for log files)
                if file_path.endswith('.log'):
                    try:
                        # On Windows, we might need to wait a bit
                        import time
                        time.sleep(0.5)
                    except:
                        pass
                os.remove(file_path)
                removed_files.append(file_path)
                print(f"   ✅ Removed: {file_path}")
            except PermissionError as e:
                errors.append(f"Permission error removing {file_path}: {str(e)}")
                print(f"   ⚠️  Permission error: {file_path}")
                print(f"      → File might be in use. Close Flask app and try again.")
            except Exception as e:
                errors.append(f"Error removing {file_path}: {str(e)}")
                print(f"   ❌ Error removing {file_path}: {str(e)}")
        else:
            print(f"   ⚠️  Not found: {file_path}")
    
    # Remove directories
    print("\n📁 Removing directories...")
    for dir_path in DIRS_TO_REMOVE:
        if os.path.exists(dir_path):
            try:
                # For node_modules, try with error handling for locked files
                if 'node_modules' in dir_path:
                    import time
                    time.sleep(1)  # Wait a bit for any processes to release files
                shutil.rmtree(dir_path, ignore_errors=False)
                removed_dirs.append(dir_path)
                print(f"   ✅ Removed: {dir_path}")
            except PermissionError as e:
                errors.append(f"Permission error removing {dir_path}: {str(e)}")
                print(f"   ⚠️  Permission error: {dir_path}")
                print(f"      → Some files might be locked. Close VS Code/editors and try again.")
                print(f"      → Or manually delete: rmdir /s /q {dir_path}")
            except Exception as e:
                errors.append(f"Error removing {dir_path}: {str(e)}")
                print(f"   ⚠️  Error removing {dir_path}: {str(e)}")
                print(f"      → Try manually: rmdir /s /q {dir_path}")
        else:
            print(f"   ⚠️  Not found: {dir_path}")
    
    # Summary
    print("\n" + "=" * 60)
    print("Summary:")
    print(f"   Files removed: {len(removed_files)}")
    print(f"   Directories removed: {len(removed_dirs)}")
    print(f"   Errors: {len(errors)}")
    
    if errors:
        print("\n⚠️  Errors encountered:")
        for error in errors:
            print(f"   - {error}")
    
    print("\n✅ Cleanup complete!")
    
    if errors:
        print("\n⚠️  Some files couldn't be removed:")
        print("   → flask_app/flask_app.log: Stop Flask app first, then delete manually")
        print("   → iot-dashboard/node_modules: Close VS Code/editors, then delete manually")
        print("\n   Manual cleanup commands:")
        print("   - Stop Flask app (Ctrl+C in Flask terminal)")
        print("   - del flask_app\\flask_app.log")
        print("   - rmdir /s /q iot-dashboard\\node_modules")
    
    print("\nNext steps:")
    print("1. Fix any remaining errors (see above)")
    print("2. Review the .gitignore file")
    print("3. Run: git status")
    print("4. Run: git add .")
    print("5. Run: git commit -m 'Initial commit'")
    print("6. Run: git push")
    print("=" * 60)

if __name__ == "__main__":
    response = input("This will delete files. Continue? (yes/no): ")
    if response.lower() in ['yes', 'y']:
        cleanup()
    else:
        print("Cleanup cancelled.")


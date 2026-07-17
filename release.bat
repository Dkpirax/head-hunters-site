@echo off
REM Deploy script for head-hunters-site to Spaceship Server (cPanel Node.js App)

setlocal enabledelayedexpansion

echo ========================================
echo Spaceship Server Deployment Script
echo ========================================
echo.

REM Clean up
echo [1/5] Cleaning previous deployment files...
if exist "spaceship_deploy" (
    rmdir /s /q spaceship_deploy
)
if exist "spaceship_deploy.zip" (
    del /q "spaceship_deploy.zip"
)
echo.

REM Build Frontend
echo [2/5] Building Vite Frontend...
cd frontend
call npm run build
if errorlevel 1 (
    echo ERROR: Frontend build failed!
    pause
    exit /b 1
)
cd ..
echo.

REM Build Backend
echo [3/5] Building Express Backend...
cd backend
call npm run build
if errorlevel 1 (
    echo ERROR: Backend build failed!
    pause
    exit /b 1
)
cd ..
echo.

REM Create deploy structure
echo [4/5] Creating deploy structure...
mkdir spaceship_deploy 2>nul
mkdir spaceship_deploy\public 2>nul

echo Copying backend files...
xcopy /E /I /Y "backend\dist\*" "spaceship_deploy\" >nul
copy /Y "backend\package.json" "spaceship_deploy\" >nul

echo Copying frontend files to public folder...
xcopy /E /I /Y "frontend\dist\*" "spaceship_deploy\public\" >nul

REM Copy environment file if exists
if exist ".env" (
    echo Copying .env file...
    copy /Y ".env" "spaceship_deploy\" >nul
) else if exist ".env.production" (
    echo Copying .env.production file...
    copy /Y ".env.production" "spaceship_deploy\.env" >nul
)

echo.

REM Zip the deployment files
echo [5/5] Zipping deploy files...
tar -a -c -f spaceship_deploy.zip -C spaceship_deploy .
if errorlevel 1 (
    echo ERROR: Zipping failed!
    pause
    exit /b 1
)
echo Created spaceship_deploy.zip
echo.

REM Clean up temporary deployment folder
echo Cleaning up temporary files...
if exist "spaceship_deploy" (
    rmdir /s /q spaceship_deploy
)

echo ========================================
echo Deployment Preparation Complete!
echo ========================================
echo.
echo 1. Your app has been built and packaged into 'spaceship_deploy.zip'.
echo 2. Upload and extract 'spaceship_deploy.zip' directly to your target folder on Spaceship.
echo 3. In cPanel Setup Node.js App:
echo    - Set 'Application root' to your target folder.
echo    - Set 'Application startup file' to 'index.js'.
echo    - Click 'Save' and 'Start App'.
echo    - Make sure to run 'NPM Install' inside the cPanel interface.
echo.
pause

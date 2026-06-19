@echo off
REM Deploy script for head-hunters-site to Spaceship Server

setlocal enabledelayedexpansion

echo ========================================
echo Spaceship Server Deployment Script
echo ========================================
echo.

REM Clean up
echo [1/4] Cleaning previous deployment files...
if exist "spaceship_deploy" (
    rmdir /s /q spaceship_deploy
)
if exist "spaceship_deploy.zip" (
    del /q "spaceship_deploy.zip"
)
echo.

REM Build Next.js app
echo [2/4] Building Next.js application...
call npm run build
if errorlevel 1 (
    echo ERROR: Next.js build failed!
    pause
    exit /b 1
)
echo.

REM Create deploy structure
echo [3/4] Creating deploy structure...
mkdir spaceship_deploy 2>nul

REM Check if standalone build exists
if not exist ".next\standalone" (
    echo ERROR: Standalone build not found in .next\standalone.
    echo Please ensure "output: 'standalone'" is configured in next.config.ts.
    pause
    exit /b 1
)

echo Copying standalone server files...
xcopy /E /I /Y ".next\standalone" "spaceship_deploy\" >nul

echo Copying public files...
if exist "public" (
    xcopy /E /I /Y "public" "spaceship_deploy\public\" >nul
)

echo Copying static files...
if exist ".next\static" (
    xcopy /E /I /Y ".next\static" "spaceship_deploy\.next\static\" >nul
)

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
echo [4/4] Zipping deploy files...
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
echo 1. Your Next.js app has been built and packaged into 'spaceship_deploy.zip'.
echo 2. Upload and extract 'spaceship_deploy.zip' directly to your target folder on Spaceship.
echo 3. In cPanel Setup Node.js App:
echo    - Set 'Application root' to your target folder.
echo    - Set 'Application startup file' to 'server.js'.
echo    - Click 'Save' and 'Start App'.
echo.
pause

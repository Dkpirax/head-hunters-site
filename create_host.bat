@echo off
REM Create host folder for Spaceship cPanel

setlocal enabledelayedexpansion

echo ========================================
echo Spaceship cPanel Host Folder Creator
echo ========================================
echo.

set "HOST_DIR=host"

REM Clean up
echo [1/3] Cleaning previous host folder...
if exist "%HOST_DIR%" (
    rmdir /s /q "%HOST_DIR%"
)
echo.

REM Build Next.js app
echo [2/3] Building Next.js application...
call npm run build
if errorlevel 1 (
    echo ERROR: Next.js build failed!
    pause
    exit /b 1
)
echo.

REM Create deploy structure
echo [3/3] Creating host folder structure...
mkdir "%HOST_DIR%" 2>nul

REM Check if standalone build exists
if not exist ".next\standalone" (
    echo ERROR: Standalone build not found in .next\standalone.
    echo Please ensure "output: 'standalone'" is configured in next.config.ts.
    pause
    exit /b 1
)

echo Copying standalone server files...
xcopy /E /I /Y ".next\standalone" "%HOST_DIR%\" >nul

echo Copying public files...
if exist "public" (
    xcopy /E /I /Y "public" "%HOST_DIR%\public\" >nul
)

echo Copying static files...
if exist ".next\static" (
    xcopy /E /I /Y ".next\static" "%HOST_DIR%\.next\static\" >nul
)

REM Copy environment file if exists
if exist ".env" (
    echo Copying .env file...
    copy /Y ".env" "%HOST_DIR%\" >nul
) else if exist ".env.production" (
    echo Copying .env.production file...
    copy /Y ".env.production" "%HOST_DIR%\.env" >nul
)

echo.
echo ========================================
echo Host Folder Creation Complete!
echo ========================================
echo.
echo Your Next.js app has been built and prepared in the '%HOST_DIR%' folder.
echo You can upload the contents of the '%HOST_DIR%' folder to your Spaceship cPanel.
echo.
pause

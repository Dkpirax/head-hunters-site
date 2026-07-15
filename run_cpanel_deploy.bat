@echo off
setlocal enabledelayedexpansion

echo ==========================================
echo Running Packaged Application (Production)
echo ==========================================
echo.

if not exist cpanel_deploy (
    echo Error: 'cpanel_deploy' folder not found.
    echo Please run build_production.bat first!
    echo.
    pause
    exit /b 1
)

cd cpanel_deploy

echo Starting Express Server...
node index.js

pause

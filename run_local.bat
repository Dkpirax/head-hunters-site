@echo off
setlocal enabledelayedexpansion

echo ==========================================
echo Starting Head Hunters Local Environment
echo ==========================================
echo.

echo [1/2] Checking and freeing port 3000...
for /f "tokens=5" %%a in ('netstat -a -n -o ^| findstr :3000 ^| findstr LISTENING') do (
    echo Port 3000 is occupied by PID %%a. Killing it...
    taskkill /F /PID %%a >nul 2>&1
)

echo Port 3000 is ready.
echo.

echo [2/2] Starting Next.js Development Server...
cmd /c npm run dev

pause

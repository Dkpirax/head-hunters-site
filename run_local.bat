@echo off
setlocal enabledelayedexpansion

echo ==========================================
echo Starting Head Hunters Local Environment
echo ==========================================
echo.

echo [1/2] Starting Express Backend (Port 3001)
start "Backend Server" cmd /k "cd backend && npm run dev"

echo [2/2] Starting Vite Frontend (Port 5173)
start "Frontend Server" cmd /k "cd frontend && npm run dev"

echo.
echo Development servers are starting in new windows.
echo Keep those windows open to see logs.
echo.
pause

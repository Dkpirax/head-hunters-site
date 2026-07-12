@echo off
REM Start the Next.js standalone server from the host folder

echo ========================================
echo Starting Local Production Server
echo ========================================
echo.

if not exist "host\server.js" (
    echo ERROR: host\server.js not found! 
    echo Please run create_host.bat first to generate the host folder.
    pause
    exit /b 1
)

cd host

REM Set default port if not specified
set PORT=3000
set NODE_ENV=production

echo Server is starting on http://localhost:%PORT%
echo Press Ctrl+C to stop the server.
echo.

node server.js
pause

@echo off
setlocal enabledelayedexpansion

echo ==========================================
echo Building Head Hunters for cPanel
echo ==========================================
echo.

echo [1/4] Running Next.js Production Build...
call npm run build
if %errorlevel% neq 0 (
    echo Build failed. Exiting...
    pause
    exit /b %errorlevel%
)

echo.
echo [2/4] Preparing Standalone Folder...
if exist "cpanel_build" rmdir /s /q "cpanel_build"
mkdir "cpanel_build"

echo Copying standalone files...
xcopy /E /I /Q /Y /H ".next\standalone" "cpanel_build" >nul
echo Injecting Prisma Auto-Migration...
move /Y "cpanel_build\server.js" "cpanel_build\next-server.js" >nul
copy /Y "cpanel-server.js" "cpanel_build\server.js" >nul
echo Copying static files...
xcopy /E /I /Q /Y /H ".next\static" "cpanel_build\.next\static" >nul
echo Copying public files...
if exist "public" xcopy /E /I /Q /Y /H "public" "cpanel_build\public" >nul
echo Copying environment variables...
copy /Y ".env" "cpanel_build\.env" >nul
echo Copying Prisma schema...
xcopy /E /I /Q /Y /H "prisma" "cpanel_build\prisma" >nul
echo Copying database initialization script...
copy /Y "init-db.js" "cpanel_build\init-db.js" >nul

echo.
echo [3/4] Creating ZIP archive for cPanel...
if exist "cpanel_deploy.zip" del /f /q "cpanel_deploy.zip"
powershell -Command "Compress-Archive -Path 'cpanel_build\*' -DestinationPath 'cpanel_deploy.zip' -Force"

echo.
echo [4/4] Cleaning up temporary files...
@REM rmdir /s /q "cpanel_build"

echo.
echo ==========================================
echo Build Successful! 
echo ==========================================
echo Your cPanel deployment package is ready: 'cpanel_deploy.zip'
echo.
echo cPanel Instructions:
echo 1. Upload 'cpanel_deploy.zip' to your cPanel File Manager and extract it.
echo 2. Setup a 'Node.js App' in cPanel pointing to that extracted folder.
echo 3. Ensure the startup file in the Node.js App is set to 'server.js' and restart it.
echo Note: The database tables will automatically be created on startup!
echo ==========================================
pause

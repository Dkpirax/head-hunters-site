@echo off
echo ==========================================
echo Building Project for Production
echo ==========================================

echo.
echo [1/2] Building Vite React Frontend...
cd frontend
call npm run build
if %errorlevel% neq 0 (
    echo Frontend build failed!
    exit /b %errorlevel%
)
cd ..

echo.
echo [2/2] Building Express Backend...
cd backend
call npx tsc
if %errorlevel% neq 0 (
    echo Backend build failed!
    exit /b %errorlevel%
)
cd ..

echo.
echo [3/3] Packaging into deployment folder...
if exist cpanel_deploy rmdir /s /q cpanel_deploy
mkdir cpanel_deploy

:: Copy backend files
xcopy /E /I /Y backend\dist cpanel_deploy
copy backend\package.json cpanel_deploy\package.json
copy .env cpanel_deploy\.env

:: Copy frontend files to public
mkdir cpanel_deploy\public
xcopy /E /I /Y frontend\dist cpanel_deploy\public

echo.
echo ==========================================
echo Build Successful!
echo ==========================================
echo Your complete application is packaged in the 'cpanel_deploy' folder.
echo.

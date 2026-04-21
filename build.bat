@echo off
REM Cross-Platform Build Script for Windows
REM Builds Gather The Crown for Desktop (Electron), Mobile (Expo), and Web (Vite)

setlocal enabledelayedexpansion
cls

echo.
echo 🎮 Gather The Crown - Cross-Platform Build
echo ===========================================
echo.

REM Check for Node.js
where node >nul 2>nul
if errorlevel 1 (
    echo ERROR: Node.js not found. Please install Node.js from https://nodejs.org
    exit /b 1
)

echo ✓ Node.js found: 
node --version

REM Check for pnpm
where pnpm >nul 2>nul
if errorlevel 1 (
    echo Installing pnpm...
    npm install -g pnpm
)
echo ✓ pnpm found

REM Get build target
if "%1"=="" (
    echo Usage: build.bat [web^|server^|desktop^|mobile^|all]
    echo.
    echo Examples:
    echo   build.bat web       - Build web version
    echo   build.bat desktop   - Build desktop app (Windows/Mac/Linux)
    echo   build.bat mobile    - Prepare mobile build (iOS/Android)
    echo   build.bat all       - Build all platforms
    exit /b 1
)

REM Set build target
set BUILD_TARGET=%1

REM Execute build
if "%BUILD_TARGET%"=="web" (
    echo Building web version...
    cd packages\client
    call npm run build
    if errorlevel 1 exit /b 1
    cd ..\..
    echo ✓ Web build complete
) else if "%BUILD_TARGET%"=="server" (
    echo Building server...
    cd packages\server
    call npm run build
    if errorlevel 1 exit /b 1
    cd ..\..
    echo ✓ Server build complete
) else if "%BUILD_TARGET%"=="desktop" (
    echo Building desktop application...
    cd packages\client
    call npm run build
    if errorlevel 1 exit /b 1
    cd ..\..
    
    where electron-builder >nul 2>nul
    if errorlevel 1 (
        echo Installing electron-builder...
        npm install -g electron-builder
    )
    
    echo Building Electron app...
    call npx electron-builder --win --mac --linux --publish=never
    if errorlevel 1 exit /b 1
    echo ✓ Desktop build complete
    echo Desktop installers located in dist\
) else if "%BUILD_TARGET%"=="mobile" (
    echo Preparing mobile build...
    
    where expo >nul 2>nul
    if errorlevel 1 (
        echo Installing Expo CLI...
        npm install -g expo-cli
    )
    
    if not exist "app.json" (
        echo Setting up Expo...
        copy mobile-app.json app.json
    )
    
    echo ✓ Mobile build configuration ready
    echo Run 'expo build:ios' for iOS
    echo Run 'expo build:android' for Android
) else if "%BUILD_TARGET%"=="all" (
    echo Building all platforms...
    
    call %0 web
    if errorlevel 1 exit /b 1
    
    call %0 server
    if errorlevel 1 exit /b 1
    
    call %0 desktop
    if errorlevel 1 exit /b 1
    
    call %0 mobile
    if errorlevel 1 exit /b 1
    
    echo.
    echo ✓ All builds complete!
) else (
    echo Invalid target: %BUILD_TARGET%
    echo Valid options: web, server, desktop, mobile, all
    exit /b 1
)

echo.
pause

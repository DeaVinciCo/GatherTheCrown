@echo off
title Gather The Crown: Creats & Foes
color 0E
echo.
echo ========================================
echo   🏰 GATHER THE CROWN: CREATS & FOES 🏰
echo ========================================
echo.
echo   An Epic Medieval Adventure Awaits!
echo.
echo ========================================
echo.

echo Checking system requirements...
python --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Python not found!
    echo.
    echo Please install Python 3.7+ from: https://python.org
    echo Make sure to check "Add Python to PATH" during installation
    echo.
    pause
    exit /b 1
)

echo ✅ Python found!
echo Installing game requirements...
echo.

pip install pygame >nul 2>&1
if errorlevel 1 (
    echo Trying alternative installation method...
    pip3 install pygame >nul 2>&1
    if errorlevel 1 (
        echo ⚠️  Could not auto-install pygame
        echo Please run: pip install pygame
        echo Then try again
        pause
        exit /b 1
    )
)

echo ✅ Game ready!
echo.
echo 🚀 Launching Gather The Crown...
echo.

python main_launcher.py

if errorlevel 1 (
    echo.
    echo ⚠️  Game encountered an error
    echo Check GAME_PACKAGE_README.md for troubleshooting
    echo.
)

echo.
echo Thanks for playing! 👑
echo.
pause
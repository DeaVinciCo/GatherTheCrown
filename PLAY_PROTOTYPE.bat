@echo off
echo ========================================
echo  Gather The Crown: Prototype Launcher
echo ========================================
echo.

cd prototype

REM Check if pygame is installed
python -c "import pygame" 2>nul
if errorlevel 1 (
    echo [ERROR] Pygame is not installed!
    echo.
    echo Installing pygame now...
    pip install pygame
    echo.
)

echo Starting game...
echo.
python main.py

if errorlevel 1 (
    echo.
    echo [ERROR] Game failed to start!
    echo.
    echo Possible issues:
    echo - Python not installed
    echo - Missing game files
    echo - Pygame not installed
    echo.
    echo Press any key to exit...
    pause >nul
) else (
    echo.
    echo Game closed normally.
    echo Press any key to exit...
    pause >nul
)

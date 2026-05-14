@echo off
echo ========================================
echo  GATHER THE CROWN: CREATS AND FOES
echo  Starting Game...
echo ========================================
echo.

cd prototypes

echo Checking for Node.js...
where node >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo ERROR: Node.js is not installed!
    echo.
    echo Please install Node.js from: https://nodejs.org
    echo Download the LTS version and install it.
    echo Then run this file again.
    pause
    exit
)

echo Node.js found!
echo.

echo Installing game dependencies...
call npm install

echo.
echo Starting game server...
echo.
echo ========================================
echo  GAME IS STARTING!
echo  Your browser will open automatically
echo  If not, go to: http://localhost:5173
echo ========================================
echo.

call npm run dev

pause

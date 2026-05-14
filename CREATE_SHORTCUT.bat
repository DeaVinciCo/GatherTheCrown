@echo off
echo Creating desktop shortcut...

set SCRIPT_DIR=%~dp0
set SHORTCUT_PATH=%USERPROFILE%\Desktop\Play Gather The Crown.lnk

powershell -Command "$WshShell = New-Object -ComObject WScript.Shell; $Shortcut = $WshShell.CreateShortcut('%SHORTCUT_PATH%'); $Shortcut.TargetPath = '%SCRIPT_DIR%PLAY_PROTOTYPE.bat'; $Shortcut.WorkingDirectory = '%SCRIPT_DIR%'; $Shortcut.IconLocation = 'C:\Windows\System32\SHELL32.dll,14'; $Shortcut.Description = 'Launch Gather The Crown Prototype'; $Shortcut.Save()"

if exist "%SHORTCUT_PATH%" (
    echo.
    echo SUCCESS! Shortcut created on your desktop!
    echo.
    echo You can now double-click "Play Gather The Crown" on your desktop to launch the game.
) else (
    echo.
    echo ERROR: Could not create shortcut.
)

echo.
pause

@echo off
title Hermes - Sharma Industries Commercial Brain
cd /d "D:\Sharma Industries\Jarvis Agent"
echo ========================================================
echo   Starting Hermes Agent for Sharma Industries
echo   Workspace: D:\Sharma Industries\Jarvis Agent
echo   CEO: Ashutosh Sharma (+91 9079609627)
echo ========================================================
echo.
"%LOCALAPPDATA%\hermes\bin\hermes.exe" --in "D:\Sharma Industries\Jarvis Agent" %*
pause

@echo off
title Hermes Local Dashboard Server - Sharma Industries
cd /d "D:\Sharma Industries\Jarvis Agent"
echo ========================================================
echo   Starting Hermes Web Dashboard Server
echo   URL: http://127.0.0.1:9119
echo   Workspace: D:\Sharma Industries\Jarvis Agent
echo ========================================================
echo.
"%LOCALAPPDATA%\hermes\bin\hermes.exe" dashboard --skip-build
pause

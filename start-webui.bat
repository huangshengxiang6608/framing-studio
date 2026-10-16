@echo off
title Framing Studio WebUI Test Launcher
powershell.exe -NoProfile -ExecutionPolicy Bypass -File "%~dp0start-webui.ps1" %*
if errorlevel 1 (
    echo.
    echo [ERROR] Failed to launch Framing Studio WebUI.
    pause
)

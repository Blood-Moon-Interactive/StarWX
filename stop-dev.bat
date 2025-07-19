@echo off
title Stop StarWX Development Server

echo ========================================
echo Stopping StarWX Development Server
echo ========================================
echo.

:: Find and kill Vite processes
echo Looking for Vite development server...
tasklist /FI "IMAGENAME eq node.exe" /FO CSV | findstr /I "vite" >nul
if %errorlevel% equ 0 (
    echo Found Vite process, stopping...
    taskkill /F /IM node.exe /FI "WINDOWTITLE eq *vite*" >nul 2>&1
    if %errorlevel% equ 0 (
        echo Development server stopped successfully!
    ) else (
        echo Could not stop server automatically.
        echo Please press Ctrl+C in the server window or close it manually.
    )
) else (
    echo No Vite development server found running.
)

echo.
pause 
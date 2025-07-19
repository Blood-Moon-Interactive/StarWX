@echo off
title StarWX Development Server

echo ========================================
echo StarWX Development Server
echo ========================================
echo.

:: Check if we're in the right directory
if not exist "frontend\package.json" (
    echo Error: frontend\package.json not found!
    echo Please run this script from the StarWX project root directory.
    pause
    exit /b 1
)

:: Navigate to frontend directory
cd frontend

:: Check if node_modules exists, if not install dependencies
if not exist "node_modules" (
    echo Installing dependencies...
    npm install
    if errorlevel 1 (
        echo Error: Failed to install dependencies!
        pause
        exit /b 1
    )
    echo Dependencies installed successfully!
    echo.
)

echo Starting development server...
echo.
echo The site will be available at: http://localhost:5173
echo Press Ctrl+C to stop the server
echo.

:: Start the development server
npm run dev

:: If we get here, the server was stopped
echo.
echo Development server stopped.
pause 
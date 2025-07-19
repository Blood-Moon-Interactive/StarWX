# StarWX Development Server Script
# Run this script from the project root directory

param(
    [switch]$Stop
)

$scriptName = "StarWX Development Server"
$frontendPath = "frontend"
$packageJsonPath = Join-Path $frontendPath "package.json"

Write-Host "========================================" -ForegroundColor Cyan
Write-Host $scriptName -ForegroundColor Yellow
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Check if we're in the right directory
if (-not (Test-Path $packageJsonPath)) {
    Write-Host "Error: $packageJsonPath not found!" -ForegroundColor Red
    Write-Host "Please run this script from the StarWX project root directory." -ForegroundColor Yellow
    Read-Host "Press Enter to exit"
    exit 1
}

# Navigate to frontend directory
Set-Location $frontendPath

# Check if node_modules exists, if not install dependencies
if (-not (Test-Path "node_modules")) {
    Write-Host "Installing dependencies..." -ForegroundColor Green
    try {
        npm install
        if ($LASTEXITCODE -ne 0) {
            throw "npm install failed"
        }
        Write-Host "Dependencies installed successfully!" -ForegroundColor Green
        Write-Host ""
    }
    catch {
        Write-Host "Error: Failed to install dependencies!" -ForegroundColor Red
        Write-Host $_.Exception.Message -ForegroundColor Red
        Read-Host "Press Enter to exit"
        exit 1
    }
}

Write-Host "Starting development server..." -ForegroundColor Green
Write-Host ""
Write-Host "The site will be available at: http://localhost:5173" -ForegroundColor Cyan
Write-Host "Press Ctrl+C to stop the server" -ForegroundColor Yellow
Write-Host ""

# Start the development server
try {
    npm run dev
}
catch {
    Write-Host ""
    Write-Host "Development server stopped." -ForegroundColor Yellow
    Read-Host "Press Enter to exit"
} 
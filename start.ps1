# AegisTrips - start all three services
$root = $PSScriptRoot

Write-Host ""
Write-Host "AegisTrips - Zero-Knowledge Travel Agent" -ForegroundColor Cyan
Write-Host "Starting all services..." -ForegroundColor DarkGray
Write-Host ""

# 1 - Secure Worker (TEE + T3N) on port 3001
Write-Host "[1/3] Secure Worker  -> http://localhost:3001" -ForegroundColor Cyan
Start-Process powershell `
    -ArgumentList "-NoExit", "-Command", "npm run dev" `
    -WorkingDirectory "$root\secure-worker"

Write-Host "      Waiting 6s for T3N handshake..." -ForegroundColor DarkGray
Start-Sleep -Seconds 6

# 2 - Backend (Gemini AI) on port 8000
Write-Host "[2/3] Backend        -> http://localhost:8000" -ForegroundColor Blue
Start-Process powershell `
    -ArgumentList "-NoExit", "-Command", ".venv\Scripts\uvicorn main:app --reload --port 8000" `
    -WorkingDirectory "$root\backend"

Write-Host "      Waiting 4s for uvicorn..." -ForegroundColor DarkGray
Start-Sleep -Seconds 4

# 3 - Frontend (React + Vite) on port 5173
Write-Host "[3/3] Frontend       -> http://localhost:5173" -ForegroundColor Green
Start-Process powershell `
    -ArgumentList "-NoExit", "-Command", "npm run dev" `
    -WorkingDirectory "$root\frontend"

Write-Host ""
Write-Host "All services launching. Opening browser in 8s..." -ForegroundColor Yellow
Start-Sleep -Seconds 8
Start-Process "http://localhost:5173"

Write-Host "Done. Close the 3 service windows to stop." -ForegroundColor DarkGray
Write-Host ""

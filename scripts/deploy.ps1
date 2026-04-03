<#
.SYNOPSIS
    Script tu dong build va dong goi NabTravel de deploy len Namecheap.

.DESCRIPTION
    Script thuc hien:
    1. Build Next.js o che do standalone
    2. Copy public/ va .next/static/ vao standalone
    3. Copy app.js (Passenger entry point)
    4. Nen thanh file ZIP san sang upload

.EXAMPLE
    .\scripts\deploy.ps1

.NOTES
    Yeu cau: Node.js >= 18, npm da install dependencies
    Output:  nabtravel-deploy.zip tai thu muc goc du an
#>

$ErrorActionPreference = "Stop"
$ProjectRoot = Split-Path -Parent $PSScriptRoot
$StandalonePath = Join-Path $ProjectRoot ".next\standalone"
$OutputZip = Join-Path $ProjectRoot "nabtravel-deploy.zip"

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  NabTravel - Build and Package Deploy"   -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# --- Step 1: Build ---
Write-Host "[1/4] Building Next.js (standalone mode)..." -ForegroundColor Yellow
Push-Location $ProjectRoot
try {
    npm run build
    if ($LASTEXITCODE -ne 0) {
        Write-Host "  X Build failed!" -ForegroundColor Red
        Pop-Location
        exit 1
    }
    Write-Host "  OK Build succeeded" -ForegroundColor Green
}
catch {
    Write-Host "  X Build error: $_" -ForegroundColor Red
    Pop-Location
    exit 1
}
Pop-Location

# Check standalone output
if (-not (Test-Path $StandalonePath)) {
    Write-Host "  X Folder .next/standalone/ not found!" -ForegroundColor Red
    Write-Host "    Check next.config.ts has output: standalone" -ForegroundColor Red
    exit 1
}

# --- Step 2: Copy static assets ---
Write-Host "[2/4] Copying static assets..." -ForegroundColor Yellow

# Copy public/
$PublicSrc = Join-Path $ProjectRoot "public"
$PublicDest = Join-Path $StandalonePath "public"
if (Test-Path $PublicDest) { Remove-Item -Recurse -Force $PublicDest }
Copy-Item -Recurse -Force $PublicSrc $PublicDest
Write-Host "  OK public/ copied" -ForegroundColor Green

# Copy .next/static/
$StaticSrc = Join-Path $ProjectRoot ".next\static"
$StaticDest = Join-Path $StandalonePath ".next\static"
if (Test-Path $StaticDest) { Remove-Item -Recurse -Force $StaticDest }
Copy-Item -Recurse -Force $StaticSrc $StaticDest
Write-Host "  OK .next/static/ copied" -ForegroundColor Green

# --- Step 3: Copy app.js ---
Write-Host "[3/4] Copying Passenger entry point (app.js)..." -ForegroundColor Yellow
$AppJsSrc = Join-Path $ProjectRoot "app.js"
$AppJsDest = Join-Path $StandalonePath "app.js"
Copy-Item -Force $AppJsSrc $AppJsDest
Write-Host "  OK app.js copied" -ForegroundColor Green

# --- Step 4: Create ZIP ---
Write-Host "[4/4] Creating deployment package..." -ForegroundColor Yellow
if (Test-Path $OutputZip) { Remove-Item -Force $OutputZip }
Compress-Archive -Path (Join-Path $StandalonePath "*") -DestinationPath $OutputZip -Force

$ZipSize = [math]::Round((Get-Item $OutputZip).Length / 1MB, 1)
Write-Host "  OK Created: nabtravel-deploy.zip ($ZipSize MB)" -ForegroundColor Green

Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host "  Deploy package ready!"                  -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Cyan
Write-Host "  1. Upload nabtravel-deploy.zip to cPanel File Manager" -ForegroundColor White
Write-Host "  2. Extract to /home/username/nabtravel/" -ForegroundColor White
Write-Host "  3. Setup Node.js App in cPanel (see DEPLOY.md)" -ForegroundColor White
Write-Host ""

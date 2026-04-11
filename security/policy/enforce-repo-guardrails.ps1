$ErrorActionPreference = 'Stop'

$RootDir = (Resolve-Path (Join-Path $PSScriptRoot "..\..\")).Path
$ScanRoots = @(
  (Join-Path $RootDir 'haclathon'),
  (Join-Path $RootDir 'securepay')
)
$Failed = $false

function Pass([string]$Message) {
  Write-Output "[PASS] $Message"
}

function Fail([string]$Message) {
  Write-Output "[FAIL] $Message"
  $script:Failed = $true
}

function Test-NoMatch {
  param(
    [string]$Pattern,
    [string]$Description
  )

  $found = $false

  if (Get-Command rg -ErrorAction SilentlyContinue) {
    foreach ($scanRoot in $ScanRoots) {
      if (-not (Test-Path $scanRoot)) {
        continue
      }

      $rgArgs = @(
        '-n'
        '--glob', '!**/node_modules/**'
        '--glob', '!**/package-lock.json'
        '--glob', '!**/.git/**'
        '--glob', '**/*.{js,ts,jsx,tsx,mjs,cjs}'
        $Pattern
        $scanRoot
      )

      & rg @rgArgs | Out-Null
      if ($LASTEXITCODE -eq 0) {
        $found = $true
        break
      }
    }
  } else {
    foreach ($scanRoot in $ScanRoots) {
      if (-not (Test-Path $scanRoot)) {
        continue
      }

      $files = Get-ChildItem -Path $scanRoot -Recurse -File |
        Where-Object { $_.FullName -notmatch '\\node_modules\\|\\.git\\|package-lock\.json$' -and $_.Extension -match '^\.(js|ts|jsx|tsx|mjs|cjs)$' }

      foreach ($file in $files) {
        $match = Select-String -Path $file.FullName -Pattern $Pattern -ErrorAction SilentlyContinue
        if ($match) {
          $found = $true
          break
        }
      }

      if ($found) {
        break
      }
    }
  }

  if ($found) {
    Fail $Description
  } else {
    Pass $Description
  }
}

function Test-Match {
  param(
    [string]$Pattern,
    [string]$File,
    [string]$Description
  )

  if (-not (Test-Path $File)) {
    Fail "$Description (file not found: $File)"
    return
  }

  $match = $false

  if (Get-Command rg -ErrorAction SilentlyContinue) {
    & rg -n $Pattern $File | Out-Null
    if ($LASTEXITCODE -eq 0) {
      $match = $true
    }
  } else {
    $m = Select-String -Path $File -Pattern $Pattern -ErrorAction SilentlyContinue
    if ($m) {
      $match = $true
    }
  }

  if ($match) {
    Pass $Description
  } else {
    Fail $Description
  }
}

Write-Output "Running repository security guardrails (PowerShell)..."

# 0) Clean up any stray node_modules directories to ensure clean dependency installs
Write-Output "Cleaning up node_modules directories..."
$nodeModulesDirs = Get-ChildItem -Path $RootDir -Depth 2 -Directory -Filter 'node_modules' -ErrorAction SilentlyContinue
foreach ($dir in $nodeModulesDirs) {
  Remove-Item -Path $dir.FullName -Recurse -Force -ErrorAction SilentlyContinue
  Write-Output "Removed: $($dir.FullName)"
}
Write-Output "Cleaned up node_modules directories."

# 1) No insecure fallback secrets.
Test-NoMatch -Pattern 'fallback_secret|default_hmac_secret|default_key_must_be_32_characters_' -Description 'No hardcoded fallback secrets remain'

# 2) No wildcard CORS in server code.
Test-NoMatch -Pattern 'cors\(\s*\)' -Description 'No open CORS middleware calls'
Test-NoMatch -Pattern 'origin:\s*"\*"' -Description 'No wildcard CORS origin policies (double quote)'
Test-NoMatch -Pattern "origin:\s*'\*'" -Description 'No wildcard CORS origin policies (single quote)'

# 3) Haclathon backend must apply global and login-specific rate limiting.
Test-Match -Pattern 'app\.use\(globalLimiter\)' -File (Join-Path $RootDir 'haclathon\server\index.js') -Description 'Global limiter is wired in haclathon backend'
Test-Match -Pattern 'loginLimiter' -File (Join-Path $RootDir 'haclathon\server\routes\auth.js') -Description 'Login limiter is wired in haclathon auth routes'

# 4) Securepay must enforce environment-backed secrets.
Test-Match -Pattern "env\.auth\.tokenExpiry|from '../config/env\.ts'" -File (Join-Path $RootDir 'securepay\server\src\controllers\authController.ts') -Description 'Securepay auth controller uses centralized env config'
Test-Match -Pattern "from '../config/env\.ts'" -File (Join-Path $RootDir 'securepay\server\src\middleware\authMiddleware.ts') -Description 'Securepay auth middleware uses centralized env config'

# 5) Securepay encryption must use AES-GCM.
Test-Match -Pattern 'env\.encryption\.algorithm' -File (Join-Path $RootDir 'securepay\server\src\services\encryptionService.ts') -Description 'Securepay encryption uses AES-256-GCM'

if ($Failed) {
  Write-Output 'One or more policy checks failed.'
  exit 1
}

Write-Output 'All repository security guardrails passed.'
exit 0

param([switch]$Check)

$ErrorActionPreference = "Stop"
$repoRoot = Split-Path -Parent $PSScriptRoot
$sourceDir = [System.IO.Path]::GetFullPath((Join-Path $repoRoot "..\검측프로"))
$targetDir = Join-Path $repoRoot "public\gumcheuk-pro"
$files = @(
  "index.html", "app.js", "style.css", "inspectionTemplates.js",
  "inspectionDatabase.generated.js", "inspectionDataAdapter.js",
  "test-inspection-data.html", "README.md"
)

if (-not (Test-Path -LiteralPath $sourceDir -PathType Container)) {
  throw "원본 폴더를 찾을 수 없습니다: $sourceDir"
}
if (-not (Test-Path -LiteralPath $targetDir -PathType Container)) {
  throw "배포 폴더를 찾을 수 없습니다: $targetDir"
}

if (-not $Check) {
  foreach ($file in $files) {
    Copy-Item -LiteralPath (Join-Path $sourceDir $file) -Destination (Join-Path $targetDir $file) -Force
  }
}

$different = @()
foreach ($file in $files) {
  $sourceHash = (Get-FileHash -Algorithm SHA256 -LiteralPath (Join-Path $sourceDir $file)).Hash
  $targetHash = (Get-FileHash -Algorithm SHA256 -LiteralPath (Join-Path $targetDir $file)).Hash
  if ($sourceHash -ne $targetHash) {
    $different += $file
    Write-Host "DIFF $file"
  } else {
    Write-Host "SAME $file"
  }
}
if ($different.Count -gt 0) {
  throw "원본/배포본 해시 불일치: $($different -join ', ')"
}
Write-Host "검측프로 원본/배포본 SHA-256 검증 완료"
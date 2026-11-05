param(
    [Parameter(Mandatory = $true)]
    [ValidatePattern("^https?://")]
    [string]$BaseUrl
)

$ErrorActionPreference = "Stop"
$base = $BaseUrl.TrimEnd("/")

function Assert-Response {
    param(
        [string]$Path,
        [int]$ExpectedStatus,
        [string]$ExpectedContent
    )

    try {
        $response = Invoke-WebRequest -Uri "$base$Path" -SkipHttpErrorCheck
    }
    catch {
        throw "Request to $Path failed: $($_.Exception.Message)"
    }

    if ($response.StatusCode -ne $ExpectedStatus) {
        throw "$Path returned $($response.StatusCode); expected $ExpectedStatus."
    }

    if ($ExpectedContent -and $response.Content -notmatch [regex]::Escape($ExpectedContent)) {
        throw "$Path did not contain expected content: $ExpectedContent"
    }

    Write-Host "PASS $Path ($ExpectedStatus)"
}

Assert-Response -Path "/" -ExpectedStatus 200 -ExpectedContent "App Service Builder: React sample"
Assert-Response -Path "/products/widget-1" -ExpectedStatus 200 -ExpectedContent "App Service Builder: React sample"
Assert-Response -Path "/unknown-client-route" -ExpectedStatus 200 -ExpectedContent "App Service Builder: React sample"
Assert-Response -Path "/health.json" -ExpectedStatus 200 -ExpectedContent '"status": "ok"'
Assert-Response -Path "/version.json" -ExpectedStatus 200 -ExpectedContent '"app": "app-service-builder-react"'

Write-Host "All SPA endpoint checks passed."

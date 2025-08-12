# Test registration with Asset ID
# Тестирование регистрации с Asset ID

Write-Host "Testing registration with Asset ID..." -ForegroundColor Green

# Configuration
$AssetId = "1851764038715303"
$AccessToken = "EAAKETNwiKmMBPCywFUk9ydufspa6aQCH4c0cgo6kZBqPaZBAdFbsNvbOLIfq1IKg6hc3BA4k26pnZAZAH5dSwa4Es8GYPEUOzqMWWKagN6ukG2ZANOiptNfnvWe4MBaVhOc0Qt8HvkNXXjzGfSaYUGZCx7erWZAjZAu9wLKVYo5LZBYY62CMd4XsEUDhdJfS7EFyi4ouXSmv1UHZArh32thyr7FvU8undyLmrJnZCYMyUmvZAyVWFgZDZD"

Write-Host "Asset ID: $AssetId" -ForegroundColor Cyan

# Read certificate
$certPath = "whatsapp-certificate.txt"
if (-not (Test-Path $certPath)) {
    Write-Error "Certificate file not found: $certPath"
    exit 1
}

$certContent = Get-Content $certPath -Raw
$formattedCert = $certContent.Trim()

Write-Host "Certificate loaded successfully" -ForegroundColor Green

# Try different registration endpoints
$endpoints = @(
    "https://graph.facebook.com/v20.0/$AssetId/register",
    "https://graph.facebook.com/v20.0/$AssetId/phone_numbers/register",
    "https://graph.facebook.com/v20.0/$AssetId/whatsapp_register"
)

$headers = @{
    "Authorization" = "Bearer $AccessToken"
    "Content-Type" = "application/json"
}

$registerPayload = @{
    messaging_product = "whatsapp"
    certificate = $formattedCert
} | ConvertTo-Json -Compress

foreach ($endpoint in $endpoints) {
    Write-Host "`nTrying endpoint: $endpoint" -ForegroundColor Yellow
    
    try {
        Write-Host "Sending registration request..." -ForegroundColor Yellow
        $response = Invoke-RestMethod -Uri $endpoint -Method Post -Headers $headers -Body $registerPayload
        
        Write-Host "SUCCESS!" -ForegroundColor Green
        Write-Host "Response: $($response | ConvertTo-Json)" -ForegroundColor Cyan
        break
        
    } catch {
        Write-Host "Failed: $($_.Exception.Message)" -ForegroundColor Red
        
        if ($_.Exception.Response) {
            Write-Host "Status Code: $($_.Exception.Response.StatusCode)" -ForegroundColor Red
            $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
            $responseBody = $reader.ReadToEnd()
            Write-Host "Error details: $responseBody" -ForegroundColor Red
        }
    }
}


# Get WABA ID from Business Account
# Получение WABA ID через Business Account

Write-Host "Getting WABA ID from Business Account..." -ForegroundColor Green

# Configuration
$BusinessId = "1192122862934441"
$AccessToken = "EAAKETNwiKmMBPCywFUk9ydufspa6aQCH4c0cgo6kZBqPaZBAdFbsNvbOLIfq1IKg6hc3BA4k26pnZAZAH5dSwa4Es8GYPEUOzqMWWKagN6ukG2ZANOiptNfnvWe4MBaVhOc0Qt8HvkNXXjzGfSaYUGZCx7erWZAjZAu9wLKVYo5LZBYY62CMd4XsEUDhdJfS7EFyi4ouXSmv1UHZArh32thyr7FvU8undyLmrJnZCYMyUmvZAyVWFgZDZD"

Write-Host "Business ID: $BusinessId" -ForegroundColor Cyan

# Headers
$headers = @{
    "Authorization" = "Bearer $AccessToken"
}

# Try different endpoints
$endpoints = @(
    "https://graph.facebook.com/v20.0/$BusinessId/owned_whatsapp_business_accounts",
    "https://graph.facebook.com/v20.0/$BusinessId/whatsapp_business_accounts",
    "https://graph.facebook.com/v20.0/$BusinessId/assets"
)

foreach ($endpoint in $endpoints) {
    Write-Host "`nTrying: $endpoint" -ForegroundColor Yellow
    
    try {
        $response = Invoke-RestMethod -Uri $endpoint -Method Get -Headers $headers
        
        Write-Host "SUCCESS!" -ForegroundColor Green
        Write-Host "Response:" -ForegroundColor Cyan
        $response | ConvertTo-Json -Depth 10
        
        break
    } catch {
        Write-Host "Failed: $($_.Exception.Message)" -ForegroundColor Red
    }
}


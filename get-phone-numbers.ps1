# Get Phone Numbers from WhatsApp Business Account
# Получение списка номеров телефонов

Write-Host "Getting phone numbers from WhatsApp Business Account..." -ForegroundColor Green

# Configuration
$WabaId = "1851764038715303"
$AccessToken = "EAAKETNwiKmMBPCywFUk9ydufspa6aQCH4c0cgo6kZBqPaZBAdFbsNvbOLIfq1IKg6hc3BA4k26pnZAZAH5dSwa4Es8GYPEUOzqMWWKagN6ukG2ZANOiptNfnvWe4MBaVhOc0Qt8HvkNXXjzGfSaYUGZCx7erWZAjZAu9wLKVYo5LZBYY62CMd4XsEUDhdJfS7EFyi4ouXSmv1UHZArh32thyr7FvU8undyLmrJnZCYMyUmvZAyVWFgZDZD"

Write-Host "WABA ID: $WabaId" -ForegroundColor Cyan

# Headers
$headers = @{
    "Authorization" = "Bearer $AccessToken"
}

# URL for getting phone numbers
$url = "https://graph.facebook.com/v20.0/$WabaId/phone_numbers"

try {
    Write-Host "Requesting phone numbers..." -ForegroundColor Yellow
    $response = Invoke-RestMethod -Uri $url -Method Get -Headers $headers
    
    Write-Host "SUCCESS! Phone numbers found:" -ForegroundColor Green
    Write-Host "=============================" -ForegroundColor Green
    
    if ($response.data) {
        foreach ($phone in $response.data) {
            Write-Host "Phone Number: $($phone.phone_number)" -ForegroundColor Cyan
            Write-Host "Phone Number ID: $($phone.id)" -ForegroundColor Yellow
            Write-Host "Status: $($phone.verification_status)" -ForegroundColor Green
            Write-Host "---" -ForegroundColor Gray
        }
    } else {
        Write-Host "No phone numbers found in response" -ForegroundColor Yellow
        Write-Host "Full response: $($response | ConvertTo-Json)" -ForegroundColor Gray
    }
    
} catch {
    Write-Host "ERROR getting phone numbers:" -ForegroundColor Red
    Write-Host "Message: $($_.Exception.Message)" -ForegroundColor Red
    
    if ($_.Exception.Response) {
        Write-Host "Status Code: $($_.Exception.Response.StatusCode)" -ForegroundColor Red
        $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
        $responseBody = $reader.ReadToEnd()
        Write-Host "Error details: $responseBody" -ForegroundColor Red
    }
}


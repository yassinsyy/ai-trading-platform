# WhatsApp Number Status Check
# Проверяет статус номера в WhatsApp Business API

param(
    [Parameter(Mandatory=$true)]
    [string]$PhoneNumberId,
    
    [Parameter(Mandatory=$true)]
    [string]$AccessToken
)

Write-Host "📊 WhatsApp Number Status Check" -ForegroundColor Green
Write-Host "===============================" -ForegroundColor Green

# API запрос для получения информации о номере
$headers = @{
    "Authorization" = "Bearer $AccessToken"
}

$statusUrl = "https://graph.facebook.com/v20.0/$PhoneNumberId?fields=verified_name,code_verification_status,quality_rating,is_official_business_account"

try {
    $response = Invoke-RestMethod -Uri $statusUrl -Method Get -Headers $headers
    
    Write-Host "✅ Информация получена успешно!" -ForegroundColor Green
    Write-Host "`n📱 Детали номера:" -ForegroundColor Yellow
    
    # Вывод информации о номере
    $response.PSObject.Properties | ForEach-Object {
        $value = $_.Value
        $color = switch ($_.Name) {
            "verified_name" { "Cyan" }
            "code_verification_status" { 
                switch ($value) {
                    "VERIFIED" { "Green" }
                    "PENDING" { "Yellow" }
                    "REJECTED" { "Red" }
                    default { "White" }
                }
            }
            "quality_rating" { 
                switch ($value) {
                    "GREEN" { "Green" }
                    "YELLOW" { "Yellow" }
                    "RED" { "Red" }
                    default { "White" }
                }
            }
            "is_official_business_account" { 
                if ($value -eq $true) { "Green" } else { "Yellow" }
            }
            default { "White" }
        }
        
        Write-Host "$($_.Name): " -NoNewline -ForegroundColor Gray
        Write-Host "$value" -ForegroundColor $color
    }
    
    # Проверка статуса верификации
    if ($response.code_verification_status -eq "VERIFIED") {
        Write-Host "`n🎉 Номер верифицирован и готов к работе!" -ForegroundColor Green
    } elseif ($response.code_verification_status -eq "PENDING") {
        Write-Host "`n⏳ Номер ожидает верификации" -ForegroundColor Yellow
        Write-Host "💡 Возможно, нужно зарегистрировать сертификат" -ForegroundColor Cyan
    } elseif ($response.code_verification_status -eq "REJECTED") {
        Write-Host "`n❌ Номер отклонен" -ForegroundColor Red
        Write-Host "💡 Проверьте требования и попробуйте снова" -ForegroundColor Cyan
    }
    
} catch {
    Write-Error "❌ Ошибка при получении статуса:"
    Write-Host "Код ошибки: $($_.Exception.Response.StatusCode)" -ForegroundColor Red
    Write-Host "Сообщение: $($_.Exception.Message)" -ForegroundColor Red
    
    if ($_.Exception.Response) {
        $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
        $responseBody = $reader.ReadToEnd()
        Write-Host "Детали ошибки: $responseBody" -ForegroundColor Red
    }
}

Write-Host "`n🔗 Полезные ссылки:" -ForegroundColor Cyan
Write-Host "• WhatsApp Manager: https://business.facebook.com/wa/manage" -ForegroundColor White
Write-Host "• Meta Business: https://business.facebook.com" -ForegroundColor White
Write-Host "• API Documentation: https://developers.facebook.com/docs/whatsapp" -ForegroundColor White


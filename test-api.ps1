# Test API endpoints
Write-Host "Testing API endpoints..." -ForegroundColor Green

# Test health endpoint
Write-Host "`n1. Testing health endpoint..." -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "http://localhost:3001/api/v1/health" -Method GET
    Write-Host "✅ Health endpoint: $($response | ConvertTo-Json)" -ForegroundColor Green
} catch {
    Write-Host "❌ Health endpoint failed: $($_.Exception.Message)" -ForegroundColor Red
}

# Test offers endpoint
Write-Host "`n2. Testing offers endpoint..." -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "http://localhost:3001/api/v1/offers/public" -Method GET
    Write-Host "✅ Offers endpoint: Found $($response.offers.Count) offers" -ForegroundColor Green
    $response.offers | ForEach-Object { Write-Host "   - $($_.externalId): ₸$($_.currentPrice)" -ForegroundColor Cyan }
} catch {
    Write-Host "❌ Offers endpoint failed: $($_.Exception.Message)" -ForegroundColor Red
}

# Test apply pricing endpoint
Write-Host "`n3. Testing apply pricing endpoint..." -ForegroundColor Yellow
try {
    $body = @{
        newPrice = 1600
        reason = "test"
        priority = 3
    } | ConvertTo-Json
    
    $response = Invoke-RestMethod -Uri "http://localhost:3001/api/v1/offers/dev/pricing/demo-1/apply" -Method POST -Body $body -ContentType "application/json"
    Write-Host "✅ Apply pricing endpoint: $($response | ConvertTo-Json)" -ForegroundColor Green
} catch {
    Write-Host "❌ Apply pricing endpoint failed: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "`nAPI testing completed!" -ForegroundColor Green

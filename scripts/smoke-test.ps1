# ---------------------------------------------------------------------------
# MunimJi end-to-end API smoke test (PowerShell 5.1, uses curl.exe)
# Run the backend first:  mvn spring-boot:run   (or java -jar target/*.jar)
# Usage:  powershell -File scripts/smoke-test.ps1
# Exits with code 0 only if every assertion passes.
# ---------------------------------------------------------------------------
param(
    [string]$Base = "http://localhost:8080",
    [int]$WaitSeconds = 120
)

$ErrorActionPreference = "Continue"
$script:failures = 0
$script:checks = 0
$dir = Join-Path $env:TEMP "munimji-smoke"
New-Item -ItemType Directory -Force -Path $dir | Out-Null

function Assert($condition, $message) {
    $script:checks++
    if ($condition) {
        Write-Host "  PASS  $message"
    } else {
        $script:failures++
        Write-Host "  FAIL  $message" -ForegroundColor Red
    }
}

# Calls the API with curl.exe. Body is written to a temp file first so that
# PowerShell quoting never corrupts the JSON.
function Call($Method, $Path, $Token, $BodyObject, $OutFile) {
    if (-not $OutFile) { $OutFile = Join-Path $dir "body.json" }
    $bodyFile = $null
    if ($BodyObject) {
        $bodyFile = Join-Path $dir "req.json"
        # WriteAllText avoids the UTF-8 BOM, which curl would send inside the JSON
        [IO.File]::WriteAllText($bodyFile, ($BodyObject | ConvertTo-Json -Depth 6))
    }
    $curlArgs = @("-s", "-o", $OutFile, "-w", "%{http_code}", "-X", $Method, "$Base$Path")
    if ($Token) { $curlArgs += @("-H", "Authorization: Bearer $Token") }
    if ($bodyFile) { $curlArgs += @("-H", "Content-Type: application/json", "-d", "@$bodyFile") }
    $status = & curl.exe @curlArgs
    $text = ""
    if (Test-Path $OutFile) { $text = Get-Content $OutFile -Raw }
    $json = $null
    if ($text) {
        try { $json = $text | ConvertFrom-Json } catch { $json = $null }
    }
    return @{ Status = [int]$status; Text = $text; Json = $json }
}

function Section($name) {
    Write-Host ""
    Write-Host "=== $name ===" -ForegroundColor Cyan
}

# --- wait until the backend is up -----------------------------------------
Write-Host "Waiting for backend at $Base ..."
$ready = $false
$deadline = (Get-Date).AddSeconds($WaitSeconds)
while ((Get-Date) -lt $deadline) {
    $probe = Call "POST" "/api/auth/login" $null @{ email = "x@x.com"; password = "wrong" } (Join-Path $dir "probe.json")
    if ($probe.Status -in 401, 400) { $ready = $true; break }
    Start-Sleep -Seconds 2
}
if (-not $ready) {
    Write-Host "Backend did not start in time" -ForegroundColor Red
    exit 1
}
Write-Host "Backend is up."

# --- 1. auth ---------------------------------------------------------------
Section "Auth"
$r = Call "POST" "/api/auth/login" $null @{ email = "owner@munimji.local"; password = "owner123" }
Assert ($r.Status -eq 200 -and $r.Json.token) "login as owner returns 200 and a token"
$owner = $r.Json.token

$r = Call "POST" "/api/auth/login" $null @{ email = "owner@munimji.local"; password = "bad-password" }
Assert ($r.Status -eq 401) "login with wrong password returns 401"

$r = Call "POST" "/api/auth/login" $null @{ email = "staff@munimji.local"; password = "staff123" }
Assert ($r.Status -eq 200 -and $r.Json.role -eq "STAFF") "login as staff returns 200 with role STAFF"
$staff = $r.Json.token

$r = Call "POST" "/api/auth/register" $null @{ name = "No Token"; email = "nobody@x.com"; password = "secret123"; role = "STAFF" }
Assert ($r.Status -eq 403) "public register as staff is refused (403)"

$r = Call "POST" "/api/auth/register" $null @{ name = "New Shop"; email = "newshop@x.com"; password = "secret123" }
Assert ($r.Status -eq 201 -and $r.Json.token) "anyone can register a new shop as owner (201 + token)"

$r = Call "POST" "/api/auth/register" $owner @{ name = "Second Owner"; email = "owner2@munimji.local"; password = "secret123"; role = "OWNER" }
Assert ($r.Status -eq 403) "owner cannot create a second owner (403)"

$r = Call "POST" "/api/auth/register" $owner @{ name = "Shop Staff"; email = "shopstaff@x.com"; password = "secret123"; role = "STAFF" }
Assert ($r.Status -eq 201 -and $r.Json.token) "owner can register staff (201 + token)"

$r = Call "POST" "/api/auth/register" $staff @{ name = "Staff Try"; email = "stafftry@x.com"; password = "secret123"; role = "STAFF" }
Assert ($r.Status -eq 403) "staff cannot create users (403)"

$r = Call "GET" "/api/products" $null $null
Assert ($r.Status -eq 401) "products list without token returns 401"

# --- 2. seed data ----------------------------------------------------------
Section "Seed data"
$r = Call "GET" "/api/products?size=100&page=0" $owner $null
Assert ($r.Status -eq 200 -and $r.Json.totalElements -ge 20) "seed has at least 20 products (got $($r.Json.totalElements))"

$r = Call "GET" "/api/suppliers" $owner $null
Assert ($r.Status -eq 200 -and $r.Json.Count -ge 3) "seed has at least 3 suppliers (got $($r.Json.Count))"

$r = Call "GET" "/api/stock/low" $owner $null
$lowNames = @($r.Json | ForEach-Object { $_.productName })
Assert ($r.Status -eq 200 -and $r.Json.Count -ge 3) "low stock alert returns products (got $($r.Json.Count): $($lowNames -join ', '))"
Assert ($lowNames -contains "Detergent Powder 1kg" -and $lowNames -contains "Toothpaste 150g") "low stock list contains stockout products"

$r = Call "GET" "/api/stock/expired" $owner $null
Assert ($r.Status -eq 200 -and $r.Json.Count -eq 2) "expired alert returns exactly the 2 expired batches (got $($r.Json.Count))"

$r = Call "GET" "/api/stock/expiring?days=30" $owner $null
Assert ($r.Status -eq 200 -and $r.Json.Count -ge 3) "expiring alert (30 days) returns batches (got $($r.Json.Count))"

$r = Call "GET" "/api/stock" $owner $null
$rice = $r.Json | Where-Object { $_.productName -eq "Basmati Rice 5kg" }
Assert ($r.Status -eq 200 -and $rice.totalQuantity -eq 20) "stock view: rice total = sum of batches = 20 (got $($rice.totalQuantity))"

$r = Call "GET" "/api/invoices?size=10" $owner $null
$seedInvoices = $r.Json.totalElements
Assert ($r.Status -eq 200 -and $seedInvoices -eq 2) "seed has 2 invoices (got $seedInvoices)"

# --- 3. category / product / supplier + purchase with 2 batches ------------
Section "Catalog and purchase entry"
$r = Call "POST" "/api/categories" $owner @{ name = "Test Category" }
Assert ($r.Status -eq 201 -and $r.Json.id) "create category (201)"
$catId = $r.Json.id

$r = Call "POST" "/api/suppliers" $owner @{ name = "Test Supplier"; phone = "9999999999"; gstin = "23TESTGST1234A1Z9" }
Assert ($r.Status -eq 201 -and $r.Json.id) "create supplier (201)"
$supId = $r.Json.id

$r = Call "POST" "/api/products" $owner @{ name = "Filter Oil 1L"; barcode = "8909999000001"; unit = "bottle"; hsnCode = "1512"; gstRate = 12; sellingPrice = 100; reorderLevel = 5; categoryId = $catId }
Assert ($r.Status -eq 201 -and $r.Json.id) "create product (201)"
$oilId = $r.Json.id

$r = Call "GET" "/api/products?search=Filter" $owner $null
Assert ($r.Status -eq 200 -and $r.Json.totalElements -eq 1) "product search finds the new product"

$in10 = (Get-Date).AddDays(10).ToString("yyyy-MM-dd")
$in100 = (Get-Date).AddDays(100).ToString("yyyy-MM-dd")
$r = Call "POST" "/api/purchases" $owner @{
    supplierId       = $supId
    supplierBillNo   = "TEST-BILL-1"
    purchaseDate     = (Get-Date).ToString("yyyy-MM-dd")
    items            = @(
        @{ productId = $oilId; quantity = 5;  costPrice = 90; batchNo = "OIL-B1"; expiryDate = $in10 },
        @{ productId = $oilId; quantity = 10; costPrice = 95; batchNo = "OIL-B2"; expiryDate = $in100 }
    )
}
Assert ($r.Status -eq 201 -and $r.Json.total -eq 1400) "purchase with 2 batches saved, total = 1400 (got $($r.Json.total))"

$r = Call "GET" "/api/stock" $owner $null
$oil = $r.Json | Where-Object { $_.productId -eq $oilId }
Assert ($oil.totalQuantity -eq 15) "oil stock after purchase = 15 (got $($oil.totalQuantity))"

# --- 4. billing: FEFO across two batches -----------------------------------
Section "Billing (FEFO + GST)"
$invoiceCountBefore = ((Call "GET" "/api/invoices?size=1" $owner $null).Json).totalElements

$r = Call "POST" "/api/invoices" $owner @{
    customerName = "Walk-in Customer"
    discount     = 0
    items        = @(@{ productId = $oilId; quantity = 8 })
}
$fefoInvoice = $r.Json
Assert ($r.Status -eq 201 -and $fefoInvoice.invoiceNumber -match "^INV-\d{4}-\d{4}$") "invoice created with number $($fefoInvoice.invoiceNumber)"
Assert ($fefoInvoice.grandTotal -eq 896) "GST totals: grand total = 896 (got $($fefoInvoice.grandTotal))"
Assert ($fefoInvoice.cgstAmount -eq 48 -and $fefoInvoice.sgstAmount -eq 48 -and $fefoInvoice.gstAmount -eq 96) "CGST 48 + SGST 48 = GST 96 (got $($fefoInvoice.cgstAmount)/$($fefoInvoice.sgstAmount)/$($fefoInvoice.gstAmount))"

$r = Call "GET" "/api/stock" $owner $null
$oil = $r.Json | Where-Object { $_.productId -eq $oilId }
$b1 = $oil.batches | Where-Object { $_.batchNo -eq "OIL-B1" }
$b2 = $oil.batches | Where-Object { $_.batchNo -eq "OIL-B2" }
Assert ($b1.quantity -eq 0) "FEFO sold the whole earliest-expiry batch OIL-B1 first (got $($b1.quantity))"
Assert ($b2.quantity -eq 7) "FEFO continued into OIL-B2 for the remaining 3 (got $($b2.quantity))"

# GST with invoice level discount: 2 * 100 - 10 = 190 taxable, gst = 22.80
$r = Call "POST" "/api/invoices" $owner @{
    customerName = "Discount Customer"
    discount     = 10
    items        = @(@{ productId = $oilId; quantity = 2 })
}
$gstInvoice = $r.Json
Assert ($r.Status -eq 201 -and $gstInvoice.subTotal -eq 200 -and $gstInvoice.discountAmount -eq 10) "discount invoice: subtotal 200, discount 10"
Assert ($gstInvoice.gstAmount -eq 22.80 -and $gstInvoice.cgstAmount -eq 11.40 -and $gstInvoice.sgstAmount -eq 11.40) "discount GST: 190 * 12% = 22.80 split 11.40/11.40 (got $($gstInvoice.gstAmount))"
Assert ($gstInvoice.grandTotal -eq 212.80) "grand total = 212.80 (got $($gstInvoice.grandTotal))"

# --- 5. failure cases ------------------------------------------------------
Section "Failure cases and rollback"
$r = Call "POST" "/api/invoices" $owner @{
    customerName = "Too Much"
    discount     = 0
    items        = @(@{ productId = $oilId; quantity = 99 })
}
Assert ($r.Status -eq 400 -and $r.Json.message -like "*Not enough stock*") "insufficient stock returns 400 with clear message (got: $($r.Json.message))"

$countAfterFail = ((Call "GET" "/api/invoices?size=1" $owner $null).Json).totalElements
Assert ($countAfterFail -eq $invoiceCountBefore + 2) "nothing saved after failed invoice (count still $($countAfterFail))"

$r = Call "GET" "/api/stock" $owner $null
$oil = $r.Json | Where-Object { $_.productId -eq $oilId }
Assert ($oil.totalQuantity -eq 5) "stock unchanged after failed invoice (got $($oil.totalQuantity))"

# ORS has only an expired batch, it must never be sold
$ors = Call "GET" "/api/products?search=ORS" $owner $null
$orsId = $ors.Json.content[0].id
$r = Call "POST" "/api/invoices" $owner @{
    customerName = "Expired Test"
    discount     = 0
    items        = @(@{ productId = $orsId; quantity = 1 })
}
Assert ($r.Status -eq 400 -and $r.Json.message -like "*Not enough stock*") "expired batch is never sold (400)"
$countAfterExpired = ((Call "GET" "/api/invoices?size=1" $owner $null).Json).totalElements
Assert ($countAfterExpired -eq $countAfterFail) "no invoice saved for expired-stock attempt"

# Paracetamol has one expired batch (100) and one fresh batch (60): selling 30
# must only touch the fresh batch.
$r = Call "POST" "/api/invoices" $owner @{
    customerName = "Para Test"
    discount     = 0
    items        = @(@{ productId = 17; quantity = 30 })
}
Assert ($r.Status -eq 201) "sale from fresh paracetamol batch succeeds"
$r = Call "GET" "/api/stock" $owner $null
$para = $r.Json | Where-Object { $_.productId -eq 17 }
$expiredPara = $para.batches | Where-Object { $_.batchNo -eq "B-PARA-01" }
$freshPara = $para.batches | Where-Object { $_.batchNo -eq "B-PARA-02" }
Assert ($expiredPara.quantity -eq 100) "expired paracetamol batch untouched (got $($expiredPara.quantity))"
Assert ($freshPara.quantity -eq 30) "fresh paracetamol batch deducted (60 -> 30, got $($freshPara.quantity))"

# --- 6. roles --------------------------------------------------------------
Section "Role security (STAFF)"
$r = Call "GET" "/api/reports/summary" $staff $null
Assert ($r.Status -eq 403) "STAFF gets 403 on reports/summary"

$r = Call "GET" "/api/reports/gst-summary" $staff $null
Assert ($r.Status -eq 403) "STAFF gets 403 on gst-summary"

$r = Call "DELETE" "/api/products/5" $staff $null
Assert ($r.Status -eq 403) "STAFF gets 403 on delete product"

$r = Call "POST" "/api/categories" $staff @{ name = "Staff Category" }
Assert ($r.Status -eq 403) "STAFF gets 403 on create category"

$r = Call "POST" "/api/invoices" $staff @{
    customerName = "Staff Billing"
    discount     = 0
    items        = @(@{ productId = 12; quantity = 1 })
}
Assert ($r.Status -eq 201) "STAFF can create an invoice (201)"

# --- 7. PDF ----------------------------------------------------------------
Section "PDF invoice"
$pdfFile = Join-Path $dir "invoice.pdf"
$statusCode = & curl.exe -s -o $pdfFile -w "%{http_code}" -H "Authorization: Bearer $owner" "$Base/api/invoices/$($fefoInvoice.id)/pdf"
$pdfBytes = [IO.File]::ReadAllBytes($pdfFile)
$pdfHeader = [Text.Encoding]::ASCII.GetString($pdfBytes[0..3])
$pdfTail = [Text.Encoding]::ASCII.GetString($pdfBytes[($pdfBytes.Length - 20)..($pdfBytes.Length - 1)])
Assert ($statusCode -eq "200" -and $pdfHeader -eq "%PDF" -and $pdfBytes.Length -gt 1000) "PDF downloads (200, $($pdfBytes.Length) bytes, header $pdfHeader)"
Assert ($pdfTail -like "*%%EOF*") "PDF file ends with %%EOF (valid document)"

# --- 8. pagination ---------------------------------------------------------
Section "Pagination and list endpoints"
$r = Call "GET" "/api/products?search=&page=0&size=5" $owner $null
Assert ($r.Status -eq 200 -and $r.Json.content.Count -eq 5 -and $r.Json.totalPages -ge 4) "product page size 5 works (pages: $($r.Json.totalPages))"

$r = Call "GET" "/api/invoices?page=0&size=2" $owner $null
Assert ($r.Status -eq 200 -and $r.Json.content.Count -eq 2 -and $r.Json.totalElements -ge 6) "invoice pagination works (total: $($r.Json.totalElements))"

$r = Call "GET" "/api/purchases" $owner $null
Assert ($r.Status -eq 200 -and $r.Json.Count -ge 4) "purchase list contains seeds + new purchase (got $($r.Json.Count))"

# --- 9. reports ------------------------------------------------------------
Section "Reports"
$r = Call "GET" "/api/reports/summary" $owner $null
Assert ($r.Status -eq 200 -and $r.Json.todaySales -gt 1392.75) "summary todaySales includes seeded + new invoices (got $($r.Json.todaySales))"
Assert ($r.Json.lowStockCount -ge 3 -and $r.Json.expiringSoonCount -ge 3) "summary has low stock + expiring counts"
Assert ($r.Json.totalProducts -ge 21) "summary totalProducts >= 21 (got $($r.Json.totalProducts))"

$r = Call "GET" "/api/reports/monthly-sales" $owner $null
$currentMonth = (Get-Date).ToString("yyyy-MM")
Assert ($r.Status -eq 200 -and $r.Json.Count -eq 12) "monthly sales returns 12 months (got $($r.Json.Count))"
Assert ($r.Json[11].month -eq $currentMonth) "last month entry is current month $($r.Json[11].month)"
Assert ($r.Json[11].total -gt 0) "current month has sales (got $($r.Json[11].total))"

$r = Call "GET" "/api/reports/top-products?limit=5" $owner $null
Assert ($r.Status -eq 200 -and $r.Json.Count -ge 1 -and $r.Json.Count -le 5) "top products returns 1-5 rows (got $($r.Json.Count))"
Assert ($r.Json[0].quantitySold -gt 0) "top product has quantitySold > 0 (got $($r.Json[0].quantitySold))"

$r = Call "GET" "/api/reports/gst-summary" $owner $null
Assert ($r.Status -eq 200 -and $r.Json.totalGst -gt 0) "gst summary totalGst > 0 (got $($r.Json.totalGst))"
$sumSides = [decimal]$r.Json.totalCgst + [decimal]$r.Json.totalSgst
Assert ($sumSides -eq [decimal]$r.Json.totalGst) "CGST + SGST = total GST ($($r.Json.totalCgst) + $($r.Json.totalSgst) = $($r.Json.totalGst))"
Assert ($r.Json.byRate.Count -ge 1) "gst summary has per-rate breakdown (got $($r.Json.byRate.Count))"

# --- 10. invoice detail ----------------------------------------------------
Section "Invoice detail"
$r = Call "GET" "/api/invoices/$($fefoInvoice.id)" $owner $null
Assert ($r.Status -eq 200 -and $r.Json.items.Count -eq 1) "invoice detail returns its line items"
Assert ($r.Json.items[0].productName -eq "Filter Oil 1L" -and $r.Json.items[0].hsnCode -eq "1512") "invoice item carries name + HSN snapshot"

# --- summary ---------------------------------------------------------------
Write-Host ""
Write-Host "=================================================" -ForegroundColor Cyan
if ($script:failures -eq 0) {
    Write-Host "ALL $script:checks CHECKS PASSED" -ForegroundColor Green
    exit 0
} else {
    Write-Host "$script:failures of $script:checks CHECKS FAILED" -ForegroundColor Red
    exit 1
}

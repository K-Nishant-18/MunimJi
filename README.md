# MunimJi - Inventory & GST Billing for Small Shops

A complete inventory management and GST billing web app built for small kirana
stores and pharmacies. Owners buy stock in batches (with expiry dates), staff
bills customers at the counter, and the app handles FEFO stock deduction, GST
split (CGST/SGST), PDF invoices, low-stock/expiry alerts and GST reports.

Built as a fresher portfolio project: plain Java 17 + Spring Boot 3 on the
backend, React + Vite + Tailwind on the frontend, no Lombok, no shortcuts.

## Features

**Owner**
- Category, product and supplier CRUD (products keep barcode, HSN, GST rate)
- Purchase entry: supplier bill, multi-line items, every line becomes a stock
  batch with its own expiry date
- Stock dashboard: full batch view, low-stock alerts, expiring (30/60/90 days)
  and already-expired batches
- Reports: today/month sales, monthly sales chart, top products, GST summary
  per month with a per-rate breakdown (rate, taxable value, GST amount)

**Owner + Staff**
- POS billing: keyboard-first product search (type + Enter), quantity
  adjustments, invoice discount, live GST totals
- Every invoice gets a permanent number (`INV-YYYY-NNNN`) and a downloadable
  PDF tax invoice (shop GSTIN, item table, CGST/SGST, amount in words)
- Invoice list with pagination and full detail view

**Rules the app enforces**
- Stock is deducted **FEFO** (first expiry, first out) inside one transaction -
  ask for more than the shop has and nothing is saved
- Expired batches are never sold
- `BigDecimal` + `HALF_UP` rounding (2 decimals) everywhere money is touched
- STAFF can only read categories/products/stock and create/read invoices;
  everything else needs the OWNER token
- Register is open only on an empty database (bootstrap owner), afterwards an
  OWNER token is required to create users

## Tech Stack

| Layer | Choice |
|---|---|
| Backend | Java 17, Spring Boot 3.3.5, Spring Security + JWT (jjwt), Spring Data JPA |
| Database | H2 by default (zero install), MySQL via 4 env variables |
| PDF | OpenPDF 1.3.43 |
| Frontend | React 18 (JS), Vite, Tailwind CSS 3.4, React Router, Axios, Recharts |
| Tests | JUnit 5, MockMvc, in-memory H2 (`test` profile) |
| Build | Maven, npm |

## Quick Start

### 1. Backend

```powershell
cd backend
mvn spring-boot:run
# API: http://localhost:8080
```

Sample data (20 products, batches, 2 invoices) is inserted automatically on
first start from `src/main/resources/data.sql`. Set `SEED_MODE=never` to start
empty.

**Login**

| Role | Email | Password |
|---|---|---|
| OWNER | owner@munimji.local | owner123 |
| STAFF | staff@munimji.local | staff123 |

### 2. Frontend

```powershell
cd frontend
npm install
npm run dev
# App: http://localhost:5173
```

### 3. Tests

```powershell
cd backend
mvn test          # 25 tests, in-memory H2 (never touches the dev database)
```

### 4. End-to-end smoke test (all Definition-of-Done checks)

```powershell
# start the backend first, then:
./scripts/smoke-test.ps1
# expects: 59/59 checks passed
```

## Using MySQL instead of H2

```powershell
$env:DB_DRIVER="com.mysql.cj.jdbc.Driver"
$env:DB_URL="jdbc:mysql://localhost:3306/munimji?createDatabaseIfNotExist=true&useSSL=false&serverTimezone=UTC"
$env:DB_USERNAME="root"
$env:DB_PASSWORD="your_password"
cd backend; mvn spring-boot:run
```

## Project Layout

```
backend/
  src/main/java/com/munimji/
    controller/   thin REST layer, DTOs only, never entities
    service/      business rules: FEFO billing, GST, purchases, reports, PDF
    repository/   Spring Data JPA, JOIN FETCH against N+1
    entity/       JPA entities (BigDecimal + scale 2, @Enumerated STRING)
    dto/          request/response objects, grouped by feature
    config/       security rules, CORS for the Vite dev server
    security/     JWT util + filter
    exception/    one @RestControllerAdvice -> {status, message}
    util/         MoneyUtil (HALF_UP), AmountInWordsUtil (Indian numbering)
  src/main/resources/data.sql   idempotent sample data (runs on H2 + MySQL)
  src/test/                      25 tests, `test` profile (in-memory H2)
frontend/
  src/pages/       Login, Dashboard, Products, Categories, Suppliers,
                   PurchaseNew, Stock, Billing, Invoices, Reports
  src/components/  Layout, Sidebar, Navbar, Modal, Pagination, StatCard...
  src/context/     AuthContext (token, login/logout, role)
  src/api/         axios instance (JWT interceptor, error extraction)
scripts/
  smoke-test.ps1   end-to-end proof of the Definition of Done (59 checks)
```

## API Overview

```
POST /api/auth/register          (empty DB, or OWNER token)
POST /api/auth/login             -> { token, role }
GET|POST|PUT|DELETE /api/categories
GET|POST|PUT|DELETE /api/products?page=&size=&search=
GET|POST|PUT|DELETE /api/suppliers
POST /api/purchases              (lines become stock batches)
GET  /api/stock | /stock/low | /stock/expiring?days= | /stock/expired
POST /api/invoices               (FEFO + GST, 201)
GET  /api/invoices?page=&size= | /api/invoices/{id} | /{id}/pdf
GET  /api/reports/summary | /monthly-sales | /top-products | /gst-summary?month=yyyy-MM
```

Every error body looks the same: `{ "status": 400, "message": "..." }`.

## Documentation

- `DECISIONS.md` - why each technical choice was made
- `INTERVIEW_NOTES.md` - talking points for the project walkthrough
- `PROGRESS.md` - build log with verification proof
- `screenshots/` - app screenshots (placeholder)

## Known Limitations

- Invoice numbers are read-and-increment from the last invoice: fine for one
  shop, not gap-free under heavy concurrency.
- Access tokens live 24 hours; there is no refresh token yet.
- GST report is CGST/SGST (intra-state) only - IGST/inter-state is not modelled.

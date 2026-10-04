# PROGRESS

Running log of what was built and what was fixed. Every step ends with the
command that proved it works.

## Step 1 - Setup
- Created PLAN.md, DECISIONS.md, PROGRESS.md, .gitignore.
- Environment: Java 22 (compiles to 17 via maven `release`), Maven 3.9.9
  (downloaded to temp tools dir), Node 24, MySQL 8.0 available but the app
  defaults to H2 (no install needed), per the brief's local-dev requirement.
- Commit: `chore: project setup with plan, decisions and gitignore`

## Step 2 - Backend skeleton + JWT auth
- pom.xml (Spring Boot 3.3.5, JPA, Security, validation, jjwt, OpenPDF, H2,
  MySQL driver), application.properties (H2 file DB by default, MySQL via
  `DB_URL`/`DB_DRIVER`/`DB_USERNAME`/`DB_PASSWORD` env vars).
- 9 entities (BigDecimal + scale 2, `@Enumerated(STRING)`), 9 repositories,
  DTOs per feature, layered controller -> service -> repository.
- JWT: `JwtUtil`, `JwtAuthFilter`, `UserDetailsServiceImpl`, `SecurityConfig`
  with URL-based role rules and CORS for the Vite dev server.
- `GlobalExceptionHandler`: every error -> `{status, message}`.
- Fix during build: jjwt 0.11.5 needs `SignedJwt.builder()...build()` (`.compact()`
  only exists after `build()`); `.roles("OWNER")` used so authorities get the
  `ROLE_` prefix.
- Verification: `mvn -q clean compile` exit=0.
- Commit: `feat: backend skeleton with entities, repositories, JWT auth and security`

## Step 3 - Category / Product / Supplier CRUD
- Full CRUD per resource, DTOs only, `Pageable` on products (`size` capped at
  100), search by name/barcode, validation errors joined into one message,
  deletes blocked with 409 when referenced (400/409 via service checks).
- Verification: `mvn -q clean compile` exit=0.
- Commit: `feat: category, product and supplier CRUD with DTOs and pagination`

## Step 4 - Purchases and stock
- `POST /api/purchases` in one transaction: creates the purchase, one line per
  purchase item and one `StockBatch` per line (batch no + expiry + cost).
- Stock endpoints: `/api/stock` (product view with batches), `/stock/low`,
  `/stock/expiring?days=`, `/stock/expired`.
- Portable expiry queries: `CURRENT_DATE + INTERVAL '45' DAY` works on H2 and
  MySQL (MySQL's `DATE_ADD` is not understood by H2).
- Verification: `mvn -q clean compile` exit=0.
- Commit: `feat: purchase entry with stock batches and stock/alert endpoints`

## Step 5 - Billing (FEFO + GST), PDF, reports
- `InvoiceService.create` one transaction: discount split proportionally over
  lines (last line gets remainder), per-line GST at scale 8 then HALF_UP 2dp,
  CGST = SGST = gst/2 (remainder to SGST so they always add up), FEFO check
  then deduction, `INV-YYYY-NNNN` numbering, snapshot fields per item.
- Insufficient stock -> `InsufficientStockException` (400), nothing saved.
- Expired batches excluded by the FEFO query, so old medicine can never sell.
- PDF invoice via OpenPDF: shop GSTIN header, item table, CGST/SGST rows,
  amount in words (Indian numbering: crore/lakh/thousand).
- Reports: summary (today/month/counts), monthly sales (12 months), top
  products (30 days), GST summary per month with rate-wise breakdown -
  aggregations done in Java loops so they run identically on H2 and MySQL.
- Verification: `mvn -q clean compile` exit=0.
- Commit: `feat: billing with FEFO, GST calculation, invoice numbering, PDF and reports`

## Step 6 - Seed data + smoke test
- `data.sql`: 2 users, 6 categories, 3 suppliers, 20 products, 3 purchases /
  19 items / 19 batches (expiry from -10 days to +900 days), 2 invoices / 4
  items. Idempotent (`INSERT ... SELECT ... WHERE NOT EXISTS`), explicit ids
  (identity counters verified to auto-advance on both H2 and MySQL).
- `scripts/smoke-test.ps1`: starts against a running backend and asserts the
  whole Definition of Done: login, 401/403, seed counts, FEFO across two
  batches, GST 190 x 12% = 22.80 split 11.40/11.40, insufficient-stock
  rollback, expired batch never sold, staff rules, PDF magic bytes,
  pagination, all four reports.
- Verification: **59/59 CHECKS PASSED** on a fresh H2 database
  (`smoke.log`), including FEFO (OIL-B1 -> 0, OIL-B2 -> 7) and invoice
  numbering (INV-<year>-0003).
- Commit: `feat: data.sql seed (20 products, batches, invoices) and end-to-end smoke test script`

## Step 7 - Frontend
- Vite + React 18 + Tailwind 3.4, axios instance with JWT interceptor and one
  error-message extractor, `AuthContext` (token/role in localStorage),
  `ProtectedRoute`, sidebar layout.
- Pages: Login, Dashboard (stat cards + charts), Products (search, pagination,
  add/edit modal), Categories, Suppliers, PurchaseNew (multi-line form),
  Stock (all/low/expiring/expired tabs), Billing (POS: debounced search,
  Enter-to-add, qty steppers, live GST totals, PDF download after save),
  Invoices (list + detail modal + PDF), Reports (charts + GST summary with
  month picker, owner only).
- Fixes during build: `.input` component class moved into `@layer components`
  in index.css; PDF download goes through axios with the token instead of a
  plain link (a plain link is a 401); `batch.qty ?? batch.quantity` typo fixed.
- Verification: `npm run build` -> `dist/` built, 907 modules (only a chunk
  size warning from recharts), `npm run dev` -> HTTP 200 on :5173.
- Commit: `feat: React frontend - auth, dashboard, product/supplier CRUD, POS billing, stock alerts, reports`

## Step 8 - Tests (brief asked for 15, built 25)
- `application-test.properties` (`test` profile): in-memory H2
  (`jdbc:h2:mem:munimji-test`), `create-drop`, seed still runs - tests never
  touch `backend/data/`.
- Unit: `MoneyUtilTest` (HALF_UP, scale 2, null handling),
  `AmountInWordsUtilTest` (rupees+paise, lakh, zero).
- MockMvc: `AuthControllerTest` (login ok / 401 wrong password / register 403
  without token / register 201 with owner token), `SecurityRulesTest`
  (401 unauthenticated, 403 staff category, 403 staff reports, 201 staff
  invoice, 200 staff invoice list), `ProductApiTest` (201 create, 409
  duplicate barcode, 400 blank name, pagination size/totals),
  `PdfServiceTest` (PDF endpoint returns real `%PDF...%%EOF`),
  `StockApiTest` (staff low-stock, expired list contains paracetamol + ORS,
  full view has 20 products).
- Service: `InvoiceBillingTest` (FEFO across two batches -> 0 and 5 left,
  GST 135.00 -> 6.75 split 3.38/3.37 + invoice number, insufficient stock
  saves nothing, expired batch excluded: "Available: 60").
- Fix during run: 2 failures because `ProductApiTest` committed a product to
  the shared test DB -> added `@Transactional` rollback + `@AfterEach
  SecurityContextHolder.clearContext()` to every MockMvc test class.
- Verification: `mvn test` -> **Tests run: 25, Failures: 0, Errors: 0,
  Skipped: 0** (EXIT=0).
- Commit: `test: 25 focused unit, MockMvc and service tests (auth, roles, billing FEFO/GST, stock, PDF)`

## Step 9 - Docs
- `README.md`: features, roles, tech stack, quick start, credentials, API
  overview, MySQL switch, layout.
- `INTERVIEW_NOTES.md`: architecture, FEFO walkthrough, GST/money handling,
  security, tests, trade-off table, next steps.
- `screenshots/README.md`: placeholder listing the 10 screenshots to capture.
- PLAN.md checkboxes updated (1-13 done).

## Step 10 - Incident: git ref corruption (repaired)
- `git log` started failing with "your current branch appears to be broken".
- Diagnosis: `.git/refs/heads/master` had been zero-filled (41 NUL bytes)
  while the commit objects and reflog were intact.
- Fix: rewrote the ref with the last known SHA from the reflog
  (`6f736c0...`); `git log --oneline` shows all 8 commits again and
  `git status` is clean.

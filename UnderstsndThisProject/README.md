# MunimJi — UnderstsndThisProject Diagrams

Nine interactive architecture diagrams for the MunimJi inventory + GST billing app
(Spring Boot 3.3.5 / React + Vite + Tailwind, FEFO stock, GST billing, multi-owner
tenancy: public owner registration, staff users, per-shop data isolation via owner_id).

**How to open:** double-click any `.html` file (works offline, no server needed).
Each diagram supports dark/light themes and export to PNG/SVG from its own toolbar.

**File pairs:** `.json` is the editable source (archify schema), `.html` is the
delivered standalone artifact. `*.visual-check.<viewport>.<theme>.png` files are
proof screenshots (dark + light, 1440x900 and 2048x1320) shown as thumbnails in
`index.html`; `*.visual-check.json` holds the machine-readable browser receipt.

## Diagram index

| # | File | Type | Shows |
|---|------|------|-------|
| 1 | `SystemArchitecture.html` | architecture | Runtime system architecture: client tab + Vite dev server, Spring Boot jar on :8080 (Tomcat worker threads → JWT filter → CurrentTenant principal → controllers → services → JPA → HikariCP → SQL), in-process OpenPDF, and the trust boundaries between them. |
| 2 | `HLD.html` | architecture | High-level component design: 9 components with ownership boundaries — auth (JWT + per-shop tenant context), billing, stock, dashboard, reporting modules and their dependencies. |
| 3 | `LLD.html` | architecture | Low-level class-level design: controllers, services (InvoiceService, StockService, AuthService…), owner-scoped repositories, AppUserDetails/CurrentTenant, DTOs and entity relationships in three tiers, plus the public register rules. |
| 4 | `BillingSequence.html` | sequence | Bill creation call sequence across 7 participants: login, item scan, tenant check, owner-scoped FEFO stock check, GST computation, invoice persistence, PDF generation, stock deduction. |
| 5 | `BillingWorkflow.html` | workflow | Bill state workflow across UI and service lanes: draft → submit → validate → stock gate → allocate (FEFO) → per-shop number → commit, with failure/retry paths (including cross-shop 404s). |
| 6 | `StockDataflow.html` | dataflow | Stock data pipeline through 5 stages: input (purchases, billing, manual adjustment) → batch store → per-shop queries → dashboard alerts (low stock, expiring, expired) and reporting. |
| 7 | `StockBatchLifecycle.html` | lifecycle | Stock batch lifecycle across three lanes: created → active → depleted; alert states low / expiring / expired (derived per-shop queries); transitions (FEFO sale, expiry crossing, reorder crossing) with guards and time-based exits. |
| 8 | `AuthSequence.html` | sequence | Registration and tenant resolution sequence across 7 participants: anonymous register (creates OWNER, returns token), auto-login, authenticated GET with Bearer token → AppUserDetails(userId, tenantId) → owner_id-scoped query → own-shop data only, plus register rules (staff-only adds, 403s). |
| 9 | `TenantIsolation.html` | architecture | Tenant data isolation architecture: two sessions (owner A / staff A / owner B) through the shared JWT filter and CurrentTenant context into owner-scoped repositories, with security-group boundaries for the Spring Boot jar and each shop's data, plus isolation guarantees (404 on cross-shop ids, per-shop uniques). |

## Regenerating

All diagrams were validated and rendered with the archify skill
(`~/.agents/skills/archify`):

```
node bin/archify.mjs validate <type> <file.json> --quality showcase
node bin/archify.mjs deliver <type> <file.json> <file.html> --quality showcase
node bin/archify.mjs visual-check <file.html>
```

Current status: **9/9 diagrams pass all 9 showcase checks and were validated
across all four viewports (1440x900, 1600x1000, 1920x1080, 2048x1320);
1440x900 and 2048x1320 proof screenshots plus JSON receipts are retained.**
Updated for multi-tenant tenancy: public owner registration, staff-only user
adds, AppUserDetails/CurrentTenant principal, owner_id-scoped queries,
per-shop invoice numbers, and per-shop alert/report reads — plus a dedicated
registration/tenant-resolution sequence (`AuthSequence`) and a tenant
data-isolation architecture view (`TenantIsolation`).

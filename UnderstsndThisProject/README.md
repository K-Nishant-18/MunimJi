# MunimJi — UnderstsndThisProject Diagrams

Seven interactive architecture diagrams for the MunimJi inventory + GST billing app
(Spring Boot 3.3.5 / React + Vite + Tailwind, FEFO stock, GST billing).

**How to open:** double-click any `.html` file (works offline, no server needed).
Each diagram supports dark/light themes and export to PNG/SVG from its own toolbar.

**File pairs:** `.json` is the editable source (archify schema), `.html` is the
delivered standalone artifact. `.visual-check.*.png` files are viewport screenshots
(1440x900 and 2048x1320, dark + light) produced during validation.

## Diagram index

| # | File | Type | Shows |
|---|------|------|-------|
| 1 | `SystemArchitecture.html` | architecture | Runtime system architecture: client tab + Vite dev server, Spring Boot jar on :8080 (Tomcat worker threads → JWT filter → controllers → services → JPA → HikariCP → SQL), in-process OpenPDF, and the trust boundaries between them. |
| 2 | `HLD.html` | architecture | High-level component design: 9 components with ownership boundaries — auth, billing, stock, dashboard, reporting modules and their dependencies. |
| 3 | `LLD.html` | architecture | Low-level class-level design: controllers, services (BillingService, StockService, AuthService…), repositories, DTOs and entity relationships in three tiers. |
| 4 | `BillingSequence.html` | sequence | Bill creation call sequence across 7 participants: login, item scan, FEFO stock check, GST computation, invoice persistence, PDF generation, stock deduction. |
| 5 | `BillingWorkflow.html` | workflow | Bill state workflow across UI and service lanes: draft → submit → validate → stock gate → allocate (FEFO) → assign number → commit, with failure/retry paths. |
| 6 | `StockDataflow.html` | dataflow | Stock data pipeline through 5 stages: input (purchases, billing, manual adjustment) → batch store → queries → dashboard alerts (low stock, expiring, expired) and reporting. |
| 7 | `StockBatchLifecycle.html` | lifecycle | Stock batch lifecycle across three lanes: created → active → depleted; alert states low / expiring / expired; transitions (FEFO sale, expiry crossing, reorder crossing) with guards and time-based exits. |

## Regenerating

All diagrams were validated and rendered with the archify skill
(`~/.agents/skills/archify`):

```
node bin/archify.mjs validate <type> <file.json> --quality showcase
node bin/archify.mjs deliver <type> <file.json> <file.html> --quality showcase
node bin/archify.mjs visual-check <file.html>
```

Current status: **7/7 diagrams pass all 9 showcase checks and viewport
visual-checks (1440x900, 1600x1000, 1920x1080, 2048x1320).**

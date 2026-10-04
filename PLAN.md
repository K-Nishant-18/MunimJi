# MunimJi - Build Plan

Inventory and GST billing web app for small shops (kirana stores and pharmacies).

## Build order

- [x] 1. Setup: repo, docs, .gitignore, git init
- [x] 2. Backend skeleton: pom.xml, application.properties, main class, entities, repositories
- [x] 3. Auth: JWT, security config, register/login, role-based access
- [x] 4. Category, Product, Supplier CRUD with DTOs and pagination
- [x] 5. Purchase entry (creates StockBatch) + stock view + alerts (low/expiring/expired)
- [x] 6. Billing: cart, discount, GST, FEFO deduction, invoice number, PDF invoice
- [x] 7. Reports: summary, monthly sales, top products, GST summary
- [x] 8. data.sql seed: 20 products, 3 suppliers, varied-expiry batches, owner + staff
- [x] 9. Frontend scaffold: Vite + React + Tailwind + Router + Axios + Recharts
- [x] 10. Frontend pages: login, dashboard, products, categories, suppliers, purchase, stock, billing, invoices, reports
- [x] 11. Tests: 25 focused JUnit 5 + MockMvc tests (brief asked for 15)
- [x] 12. Smoke test: full API flow script (register -> login -> ... -> reports)
- [x] 13. README, INTERVIEW_NOTES, screenshots placeholder
- [ ] 14. Self-review pass (strict interviewer) + final DoD verification

## Verification after every step

- Backend: `mvn clean test` (and `mvn spring-boot:run` for startup check)
- Frontend: `npm install`, `npm run build` (and `npm run dev` startup check)
- API: run `scripts/smoke-test.ps1` against the running backend and assert real values

## Definition of Done

See the project brief: all 13 checkboxes in section 14 must be verified by
running real commands, with proof in PROGRESS.md.

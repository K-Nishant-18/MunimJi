# MunimJi - Build Plan

Inventory and GST billing web app for small shops (kirana stores and pharmacies).

## Build order

- [ ] 1. Setup: repo, docs, .gitignore, git init
- [ ] 2. Backend skeleton: pom.xml, application.properties, main class, entities, repositories
- [ ] 3. Auth: JWT, security config, register/login, role-based access
- [ ] 4. Category, Product, Supplier CRUD with DTOs and pagination
- [ ] 5. Purchase entry (creates StockBatch) + stock view + alerts (low/expiring/expired)
- [ ] 6. Billing: cart, discount, GST, FEFO deduction, invoice number, PDF invoice
- [ ] 7. Reports: summary, monthly sales, top products, GST summary
- [ ] 8. data.sql seed: 20 products, 3 suppliers, varied-expiry batches, owner + staff
- [ ] 9. Frontend scaffold: Vite + React + Tailwind + Router + Axios + Recharts
- [ ] 10. Frontend pages: login, dashboard, products, categories, suppliers, purchase, stock, billing, invoices, reports
- [ ] 11. Tests: 15 focused JUnit 5 + MockMvc tests
- [ ] 12. Smoke test: full API flow script (register -> login -> ... -> reports)
- [ ] 13. README, INTERVIEW_NOTES, screenshots placeholder
- [ ] 14. Self-review pass (strict interviewer) + final DoD verification

## Verification after every step

- Backend: `mvn clean test` (and `mvn spring-boot:run` for startup check)
- Frontend: `npm install`, `npm run build` (and `npm run dev` startup check)
- API: run `scripts/smoke-test.ps1` against the running backend and assert real values

## Definition of Done

See the project brief: all 13 checkboxes in section 14 must be verified by
running real commands, with proof in PROGRESS.md.

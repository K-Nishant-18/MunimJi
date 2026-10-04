# Interview Notes - MunimJi

Talking points for walking an interviewer through the project. Keep answers
short, then go deeper only if asked.

## 1. One-line pitch

"MunimJi is an inventory and GST billing app for small kirana stores - the
owner buys stock in expiring batches, the staff bills customers with GST, and
the app guarantees stock is always deducted first-expiry-first-out."

## 2. Architecture (30 seconds)

- Three layers: Controller -> Service -> Repository. Controllers only handle
  HTTP and validation, services own every business rule, repositories are
  Spring Data JPA interfaces.
- DTOs both ways - entities never leave the service layer, so a JPA column
  rename cannot break the frontend.
- One `@RestControllerAdvice` converts every exception into
  `{status, message}` - the frontend has exactly one error path.
- Frontend is React (no TypeScript) + Vite + Tailwind, one axios instance with
  a JWT interceptor, context instead of Redux because auth state is the only
  shared state.

## 3. The interesting problem: FEFO billing

Q: "What happens when I save an invoice?"

A: One `@Transactional` method does four things in order:
1. Load products, compute gross per line, split the invoice discount
   proportionally (last line gets the remainder so parts add up exactly).
2. Per line: taxable = gross - share, GST = taxable * rate / 100, CGST and
   SGST each half (intra-state). All `BigDecimal`, `HALF_UP`, 2 decimals.
3. FEFO check: fetch that product's batches with `quantity > 0 AND expiry >=
   today ORDER BY expiry ASC`. If total available < requested, throw
   `InsufficientStockException` and **nothing** is saved - no invoice, no
   partial deduction.
4. Otherwise deduct from the earliest-expiring batch first, build the invoice
   with snapshot values (name, HSN, price, GST rate) so old invoices stay
   correct if the product changes later.

Expired batches are excluded by the query, so medicine that expired 10 days
ago can never be sold even though it physically sits on the shelf.

Q: "Why snapshot the product fields into the invoice?"

A: Invoices are legal documents. If the shop renames a product or changes its
GST rate next month, last month's invoice and PDF must not change.

## 4. Invoice numbering

`INV-YYYY-NNNN`, read the last invoice, if it is the current year increment,
else restart at 0001. Sequence resets yearly the way GST invoices usually do.

## 5. Money handling

No `double` anywhere. `BigDecimal` with `setScale(2, RoundingMode.HALF_UP)`
(`MoneyUtil.round`) at every boundary. GST uses scale 8 internally before the
final rounding so sub-paise error does not accumulate - CGST + SGST always
equals GST exactly (asserted in tests).

## 6. Security

- Stateless JWT: login returns a token, every request sends
  `Authorization: Bearer ...`, the filter loads the user by email from the DB
  (so a revoked user dies immediately).
- URL rules in one place (`SecurityConfig`): STAFF may GET
  categories/products/stock and GET/POST invoices; reports, purchases,
  suppliers and every write are OWNER-only. Method-level annotations were
  avoided on purpose - one config file is easier to audit in an interview.
- Register is open only when the user table is empty (fresh install),
  afterwards it needs an OWNER token - that is the bootstrap problem.

## 7. N+1 and query design

- Stock view fetches batches with `JOIN FETCH` on product in one query
  instead of N+1.
- Reports aggregate in Java over a date range (12 months, 30 days) rather than
  DB-specific `GROUP BY` date functions - the same code runs on H2 and MySQL,
  which is why the seed SQL only uses portable syntax
  (`INSERT ... SELECT ... WHERE NOT EXISTS`, `CURRENT_DATE + INTERVAL '45' DAY`).
- Product list and invoice list are paged (`Pageable`, capped at size 100).

## 8. Concurrency

`stock_batch` carries `@Version`. Two cashiers billing the same last bottle at
the same time: the second gets a 409 "Stock was updated by someone else,
please retry" instead of selling -1 stock.

## 9. Testing strategy (25 tests)

- Pure unit: `MoneyUtil` rounding, amount-in-words.
- MockMvc: login/register, 401/403 role rules, product CRUD + validation,
  PDF endpoint returns a real `%PDF...%%EOF` file.
- Service-level: FEFO across two batches, GST split + invoice number,
  insufficient stock saves nothing, expired batch excluded.
- Tests run against in-memory H2 (`test` profile) and every MockMvc class is
  `@Transactional`, so tests roll back and never pollute each other.
- On top of that, `scripts/smoke-test.ps1` runs the full Definition-of-Done
  flow against a real started server (59 assertions).

## 10. Trade-offs I made (and would defend)

| Choice | Why |
|---|---|
| H2 by default, MySQL via env vars | Demo runs with zero install; MySQL support is one env change away |
| No Lombok | Interviewer can read plain getters; also Lombok breaks on some JDK/JDK-preview combos |
| Java loops for reports instead of DB GROUP BY | Portable across H2/MySQL; data volumes for a single shop are tiny |
| Context instead of Redux | One piece of shared state (auth); less ceremony |
| Discount split by line proportion | Keeps GST per line correct even with a cart-wide discount |
| Search-as-you-type with 250 ms debounce | Feels like a POS without hammering the API |

## 11. What I would add next

- Refresh tokens (currently 24 h access token), audit log of who sold what,
  HSN-wise GSTR-1 export CSV, multi-batch selection on the POS screen,
  Docker Compose for backend + MySQL, and Playwright smoke tests for the UI.

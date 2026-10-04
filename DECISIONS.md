# DECISIONS

Simple, beginner-friendly choices made where the brief was ambiguous.

1. **Package naming**: `com.munimji` with packages `config, security, entity,
   repository, dto, service, controller, exception, util`. Standard layered
   style a fresher can draw on a whiteboard.

2. **Register endpoint behaviour**: `POST /api/auth/register` is open only when
   the user table is empty (first owner bootstraps the shop). After that it
   requires an authenticated OWNER token so staff/owners can add users.
   Chosen over an always-open register (security hole) or a separate
   user-management API (out of scope).

3. **Register role field**: request may pass `role` (OWNER or STAFF), default
   OWNER. Staff users are created by the owner. The seed data contains one
   owner and one staff user.

4. **STAFF permissions**: STAFF can list categories/products, view stock,
   create/view invoices (including PDF). Everything else (creates, updates,
   deletes, purchases, suppliers, reports) is OWNER only and returns 403.

5. **Invoice-level discount**: distributed to each cart line in proportion to
   the line's gross amount (price * qty), rounded HALF_UP to 2 decimals; the
   last line gets the rounding remainder so totals always add up.

6. **FEFO query**: one query per cart line inside a single `@Transactional`
   service method (`SELECT ... WHERE product = ? AND expiry >= today AND
   quantity > 0 ORDER BY expiry ASC`). Not a scheduler, not a background job.

7. **Invoice number**: read the last invoice by id, parse `INV-YYYY-NNNN`,
   increment the sequence. Single-shop app, so no gap-free sequence guarantee
   (documented as a known limitation in README).

8. **Aggregations for reports**: simple Java loops over small query results
   (invoices/items of last 12 months / 30 days) instead of database-specific
   GROUP BY date functions, so the same code runs on MySQL and H2 in tests.

9. **Stock alerts**: plain repository queries, no scheduler (as the brief
   allows). Dashboard calls them on every load.

10. **Enum storage**: `@Enumerated(EnumType.STRING)` for `UserRole`, so the
    database column stays readable (`OWNER`/`STAFF`).

11. **Product deletion**: blocked with a clear error if the product is used in
    any purchase or invoice (invoice items keep a snapshot but still reference
    the product row). Category deletion blocked while products use it.

12. **Seeding**: `data.sql` with `INSERT IGNORE` (idempotent) runs after schema
    creation (`spring.jpa.defer-datasource-initialization=true`). Tests turn
    seeding off (`spring.sql.init.mode=never`) and build their own data with
    repositories.

13. **JWT**: jjwt 0.11.5, HS256, secret from `app.jwt.secret`
    (env `JWT_SECRET` fallback in application.properties). 24-hour expiry.

14. **Paged responses**: custom `PagedResponse` DTO (`content`, `page`,
    `size`, `totalElements`, `totalPages`) instead of Spring's `Page` JSON,
    because `PageImpl` serialization is not stable across versions.

15. **Frontend state**: only `useState`, `useEffect` and one `AuthContext`
    (token + user in localStorage). No Redux, no UI kit, per the brief.

16. **Tailwind version**: pinned to 3.4.x with the classic
    `tailwind.config.js` + PostCSS setup (the version most tutorials use,
    easy for a fresher to explain).

17. **Money**: `BigDecimal` everywhere, `RoundingMode.HALF_UP`, scale 2 for
    money and GST amounts; GST rate stored as `BigDecimal` scale 2.

18. **Concurrency**: `@Version` on `StockBatch`; `OptimisticLockingFailureException`
    is mapped to HTTP 409 with the message "Stock changed while billing.
    Please retry."

19. **Default database is H2** (file mode, `backend/data/`), so a fresh clone
    runs with zero install: `mvn spring-boot:run`. MySQL is supported through
    the same `DB_URL` / `DB_USERNAME` / `DB_PASSWORD` / `DB_DRIVER`
    environment variables (README shows the exact values). `data.sql` is
    written in SQL that runs on both (tested): `CURRENT_DATE + INTERVAL '45'
    DAY`, `CURDATE()`, `CONCAT`, and idempotent
    `INSERT ... SELECT ... WHERE NOT EXISTS (...)` instead of
    MySQL-only `INSERT IGNORE`.

20. **Seed identity columns**: `data.sql` inserts explicit ids (1, 2, 3 ...) so
    foreign keys are readable; both MySQL and H2 move their identity counter
    to max(id)+1 automatically after an explicit insert (verified).

# Phase 1 Implementation Plan — Lean Internal CRM
> 3-person startup · Goal: production-ready internal tool, not enterprise platform

---

## Auth / Security Approach for Phase 1

**Single authenticated-employee model.** Any valid session = full access. No RBAC, no role checks, no permission gates.

- All API routes require an active session — unauthenticated requests get `401`
- All authenticated users can do everything (create, update, delete, assign, publish)
- The only "admin" distinction needed right now: the seeded admin account used for initial setup
- No `@PreAuthorize`, no role columns read by the frontend, no conditional UI hiding by role

**Why this is fine for Phase 1:** 3 internal users, all trusted employees, no external access. RBAC adds code complexity and test surface with zero real-world benefit at this scale. Revisit when headcount or access tiers demand it.

---

## Keep vs De-scope

| Item | Decision | Reason |
|------|----------|--------|
| Session auth (login required) | **Keep** | Core security — unauthenticated access must be blocked |
| Single employee role | **Keep** | Simple and sufficient for 3 users |
| `@PreAuthorize` / role checks | **De-scope** | Over-engineered for current team size |
| Frontend role-based UI hiding | **De-scope** | No roles = nothing to hide |
| 403 error page per role | **De-scope** | 401 redirect to login is enough |
| Confirm `GET /users/assignable` requires auth | **Keep** | Quick check, prevents accidental data leak |
| Admin-only delete/archive guards | **De-scope** | Revisit in Phase 2 if needed |

---

## Revised Priority Order

| # | Area | Rationale |
|---|------|-----------|
| 1 | Auth route protection audit | Confirm every API endpoint requires a session — quick, high-value |
| 2 | Production session / cookie config | Cookie security settings must be correct before any real traffic |
| 3 | Storage abstraction (S3) | Hard deploy blocker — local disk loses images on every redeploy |
| 4 | Deploy / env var checklist | Can't ship without this; depends on #3 |
| 5 | Error-handling hardening | Prevents confusing blank screens and silent failures in prod |
| 6 | Spanish UI / translation cleanup | Demo credibility — every string must be in Spanish |
| 7 | Demo polish | Last mile before showing to anyone outside the team |

---

## Exact Tasks

### 1. Auth Route Protection Audit

**Backend**
- [ ] Open `SecurityConfig.java` and confirm the catch-all rule is `.anyRequest().authenticated()` — if it is, all routes are already protected
- [ ] Confirm `GET /users/assignable` is not in the `permitAll()` list
- [ ] Confirm `GET /api/v1/auth/me` returns `401` when called without a session (not a 500)
- [ ] No new annotations needed — session filter handles everything

**Frontend**
- [ ] Confirm middleware or layout redirects to `/login` for any unauthenticated page access
- [ ] Confirm `401` response from any API call clears the session and redirects to `/login` (check `client.ts` fetch wrapper)

---

### 2. Production Session / Cookie Config

**Backend — `application-prod.yml`**
```yaml
server:
  servlet:
    session:
      cookie:
        secure: true        # HTTPS only — must be true in prod
        same-site: strict
        http-only: true     # already set, confirm it stays
      timeout: 86400s

app:
  cors:
    allowed-origins: ${APP_CORS_ALLOWED_ORIGINS}  # set via env var, not hardcoded
```

**Tasks**
- [ ] Create `application-prod.yml` if it doesn't exist with the above config
- [ ] Verify `cookie.secure=false` is only in `application.yml` (dev), not inherited by prod profile
- [ ] Verify CORS `allowed-origins` is env-var-driven in prod — hardcoded `localhost:3000` must not reach prod

---

### 3. Storage Abstraction (S3 / Cloud)

**Backend**
- [ ] Confirm `StorageService` interface exists with `store(MultipartFile, String filename)`, `delete(String filename)`, `getUrl(String filename)` — if not, extract it from `LocalStorageService`
- [ ] Implement `S3StorageService` (AWS SDK v2 or Supabase Storage — same S3 API)
- [ ] Activate via `@ConditionalOnProperty(name="app.storage.provider", havingValue="s3")`
- [ ] Keep `LocalStorageService` as default (no property set = local, for dev)
- [ ] Required env vars in prod:
  ```
  APP_STORAGE_PROVIDER=s3
  APP_STORAGE_BUCKET=your-bucket-name
  AWS_REGION=us-east-1
  AWS_ACCESS_KEY_ID=...
  AWS_SECRET_ACCESS_KEY=...
  APP_STORAGE_BASE_URL=https://your-bucket.s3.amazonaws.com
  ```
- [ ] Manual test: upload a property image in prod → URL is accessible in browser → survives a redeploy

---

### 4. Deploy / Env Var Checklist

**All required env vars for prod backend**
```
SPRING_PROFILES_ACTIVE=prod
SPRING_DATASOURCE_URL=jdbc:postgresql://...
SPRING_DATASOURCE_USERNAME=...
SPRING_DATASOURCE_PASSWORD=...
APP_CORS_ALLOWED_ORIGINS=https://your-frontend-domain.com
APP_STORAGE_PROVIDER=s3
APP_STORAGE_BUCKET=...
AWS_REGION=...
AWS_ACCESS_KEY_ID=...
AWS_SECRET_ACCESS_KEY=...
APP_STORAGE_BASE_URL=...
```

**Frontend**
```
NEXT_PUBLIC_API_URL=https://your-backend-domain.com
```

**DevOps tasks**
- [ ] Provision managed PostgreSQL (Supabase, Railway, or Render Postgres)
- [ ] Confirm Flyway runs automatically on startup against fresh DB — `baseline-on-migrate: false` is correct
- [ ] Add `Dockerfile` for backend (Maven build → JAR → `eclipse-temurin:21-jre`)
- [ ] Deploy frontend to Vercel (zero config for Next.js) or add Dockerfile
- [ ] Set all env vars in hosting platform dashboard
- [ ] First-deploy smoke test: login → create lead → create property → upload image → link lead to property

---

### 5. Error-Handling Hardening

**Backend**
- [ ] `GlobalExceptionHandler`: add handler for `MethodArgumentTypeMismatchException` → `400` with message "Invalid parameter: {field}"
- [ ] Add handler for `HttpMessageNotReadableException` → `400` with message "Malformed request body"
- [ ] Add `DataIntegrityViolationException` → `409` as safety net (service-layer checks should catch first, but DB constraint violations must never return `500`)
- [ ] Confirm no endpoint returns an HTML error page — all errors must be JSON `{ "error": "..." }`

**Frontend**
- [ ] `PropertiesTab.handleLinkTypeChange` — currently silent on error — add `setLinkTypeError` state + visible alert (same pattern as `handleLink`)
- [ ] `PropertiesTab.handleSaveNote` — same, add `setSaveNoteError` state
- [ ] Lead list page — add error banner when `GET /leads` fails (currently shows empty table with no explanation)
- [ ] Property list page — same
- [ ] Add a top-level React error boundary in `app/(app)/layout.tsx` to catch unexpected render crashes

---

### 6. Spanish UI / Translation Cleanup

- [ ] Grep for English user-visible strings in JSX: `grep -r "\"[A-Z]" src/app --include="*.tsx"` — fix any that aren't in `es.ts`
- [ ] Confirm all `ActivityType` enum values have Spanish labels in `es.ts` (check `PROPERTY_LINK_UPDATED`, `PROPERTY_LINK_REMOVED`, `LEAD_ASSIGNED`)
- [ ] Confirm all `LeadStatus` values have Spanish badge labels and correct badge colors
- [ ] Confirm `LeadPropertyLinkType` values (SUGGESTED, INTERESTED, TOURED, REJECTED) render in Spanish in PropertiesTab
- [ ] Confirm all dates display as `dd/MM/yyyy` — no raw ISO strings visible to users

---

### 7. Demo Polish

- [ ] Dashboard: verify counts update after creating a lead/property (no stale cache)
- [ ] Lead list: empty state shows "No hay prospectos aún" not a blank table
- [ ] Property list: empty state shows "No hay propiedades aún"
- [ ] Property list: show primary image thumbnail in each row
- [ ] Lead detail: highlight "Próximo seguimiento" input in red if date is in the past
- [ ] Add loading skeletons to lead list and property list (currently blank while fetching)
- [ ] Set `<title>` per page: "Prospectos | CRM", "Propiedades | CRM", etc.

---

## Must-Complete Before First Production Deployment

1. Auth catch-all confirmed — every route requires a session
2. `cookie.secure=true` in prod profile
3. S3 storage implemented and tested
4. All env vars set in hosting platform
5. Managed PostgreSQL provisioned, Flyway runs clean on fresh DB
6. Smoke test passes on prod URL

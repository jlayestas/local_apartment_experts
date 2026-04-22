# CRM v1 — Technical Status Review

> Reviewed against actual source code. "Working" means a complete, wired,
> end-to-end implementation exists in code — not that it has been manually
> verified in a running instance.

---

## Working now

### Authentication
- `POST /api/v1/auth/login` → `AuthController` → `AuthService` → BCrypt verify
  → Spring session created, `last_login_at` updated.
- `GET /api/v1/auth/me` → returns the authenticated user from session.
- `POST /api/v1/auth/logout` → handled by Spring Security `LogoutFilter`;
  session invalidated server-side.
- Session cookie: `HttpOnly`, `SameSite=Strict`, 24 h TTL, up to 5 concurrent
  sessions per user.
- Frontend `AuthProvider` calls `/me` on mount to restore an existing session.
- Protected layout redirects to `/login` when unauthenticated.
- Login page shows correct error messages: `401 → invalid credentials`,
  `403 → account disabled` (generic message, no user enumeration).

### Dashboard
- `GET /api/v1/dashboard/summary` → four counts:
  new leads, unassigned, due today, overdue — all backed by indexed queries.
- `GET /api/v1/dashboard/recent-leads` → last 10 leads, JOIN-fetched to avoid N+1.
- Frontend renders four summary cards and a recent-leads table with name, status,
  urgency, agent, created-at columns. "Ver todos" link goes to /leads.

### Leads list
- `GET /api/v1/leads` supports 8 filters: `search` (name/email/phone),
  `status`, `assignedUserId`, `source`, `followUpDue`, `createdFrom`,
  `createdTo`, plus `page` / `size` (default 0/20, max 100).
- `followUpDue` correctly matches `nextFollowUpDate ≤ today AND status IN
  openStatuses()`.
- Text search is case-insensitive, parameterized (no SQL injection risk).
- Results sorted newest-first; paginated response includes totalElements,
  totalPages, last flag.
- FilterBar wires: search (Enter/button), status dropdown, agent dropdown,
  source dropdown, follow-up-due checkbox. Clear-filters button appears only
  when at least one filter is active.
- Overdue follow-up dates render in red. Unassigned / missing values show "—".
- Row click navigates to `/leads/[id]`.

### Lead detail — read view
- `GET /api/v1/leads/{id}` returns all 23 fields via `LeadDetailDTO`.
- Header shows: full name, last-updated timestamp, status badge, urgency badge,
  source badge.
- Overview tab: contact section (email, phone, WhatsApp, preferred contact
  method, language), property section (budget range, beds/baths, move-in date,
  neighborhoods, message), assignment section (agent name or "Sin asignar",
  follow-up date, last-contact date).

### Lead status change
- `POST /api/v1/leads/{id}/status` validates:
  - Lead exists.
  - Source status is not terminal (`CLOSED_WON` / `CLOSED_LOST`).
  - Self-transition rejected.
  - Writes `lead_status_history` record (with optional note).
  - Records `STATUS_CHANGED` activity.
- Database has CHECK constraint that enforces the same self-transition rule.
- Frontend selector disables while request is in flight; badge updates
  immediately on success.

### Lead agent assignment
- `POST /api/v1/leads/{id}/assign` validates assignee is active; no-ops on
  re-assignment to same user; writes `lead_assignments` history; records
  `ASSIGNED` activity.
- Frontend agent dropdown is populated from `GET /api/v1/users/assignable`
  (active users, sorted by name).

### Lead notes
- `POST /api/v1/leads/{leadId}/notes` persists a note with author = session
  user; records `LEAD_NOTE_ADDED` activity.
- `GET /api/v1/leads/{leadId}/notes` returns notes newest-first.
- Frontend: textarea with "Guardar nota" (disabled when empty); notes list
  shows author name + timestamp.
- Notes are append-only by design.

### Lead activity timeline
- `GET /api/v1/leads/{leadId}/activities` returns all entries ordered
  newest-first.
- Events recorded: `LEAD_CREATED`, `STATUS_CHANGED`, `ASSIGNED`,
  `NOTE_ADDED`, `FOLLOW_UP_SET`, `CONTACT_METHOD_UPDATED`.
- JSONB `metadata` carries typed payloads (from/to status, assignee name,
  note preview, date).
- Frontend renders a dot-timeline with human-readable descriptions, actor
  name, and timestamp.

### Create lead
- `POST /api/v1/leads` with Bean Validation on all 17 fields.
- Service creates lead, writes initial status history (NULL → NEW), optional
  assignment history, records `LEAD_CREATED` (and `ASSIGNED`) activity.
- Frontend form has three sections; client validates firstName + lastName
  required; agent dropdown optional; redirects to new lead detail on success.

### Database
- 10 Flyway migrations (V1–V10), properly ordered.
- All commonly-queried columns are indexed; composite indexes cover
  dual-filter patterns (status + assigned_user_id).
- Check constraints enforce enum values, budget ordering, non-empty note
  body, no self-transitions.
- Seed data: 3 users (admin + 2 agents) and demo leads with activities.

---

## Partially working

### Logout UI
- **Backend**: fully implemented (Spring Security `LogoutFilter`).
- **Frontend gap**: `logoutUser()` API function exists in `auth.ts`; `logout()`
  context method exists; but there is **no logout button** in `TopBar.tsx`.
  Users cannot log out from the UI without clearing cookies manually.

### Lead edit
- **Backend**: `PATCH /api/v1/leads/{id}` is fully implemented. Accepts a
  partial `UpdateLeadRequest`, updates only non-null fields, records a
  `LEAD_UPDATED` activity with a list of changed fields.
- **Frontend gap**: there is **no edit form** or edit route. The PATCH endpoint
  is dead from the UI. Lead data can only be updated via status change or
  agent assignment selectors.

### Date range filters
- **Backend**: `GET /api/v1/leads` accepts `createdFrom` and `createdTo`
  query params; `LeadSpecification` converts them correctly (UTC timezone
  aware).
- **Frontend gap**: `FilterBar` does **not expose date range inputs**. The
  `getLeads()` API wrapper does pass through any params given to it, but
  nothing calls them.

### Docker deployment
- The multi-service stack (`docker compose up --build`) now starts correctly
  after several fixes applied in this session:
  - `@BatchSize` removed from `@ManyToOne assignedUser` (Hibernate 6.5
    rejected it).
  - `::jsonb` casts added to all 30+ `metadata` values in `V8__seed_leads.sql`
    (PostgreSQL column type mismatch).
  - `window.location.href = "/login"` loop guarded with
    `pathname !== "/login"` in `client.ts`.
  - `API_URL` passed as a Docker build arg so Next.js bakes the correct
    backend URL into the routes manifest at build time.
- **Status**: all fixes are in source; the fixes in `client.ts` and the build
  arg for `API_URL` require a full `docker compose up --build` to take effect
  in the running containers.

---

## Missing

### User management UI
- Users can only be created via SQL (`V7__seed_users.sql`). There is no
  endpoint or UI to create, edit, deactivate, or reset the password of a user.
- The data model supports it (role, is_active, language fields all present).

### Lead delete
- No `DELETE /api/v1/leads/{id}` endpoint. No delete button in UI.
- Database schema uses `CASCADE` on notes, activities, assignments, and
  status history — so the infrastructure for deletion exists, but the
  feature is not exposed.

### Lead search from dashboard
- The "recent leads" table on the dashboard links to `/leads/[id]` for each
  row name, but there is no global search bar; search only works via the
  FilterBar on `/leads`.

### Follow-up date setter in UI
- The backend stores `nextFollowUpDate` and activity `FOLLOW_UP_SET` is
  recorded by the service. But there is no date-picker control in the lead
  detail UI to actually set or change the follow-up date. The field is
  display-only.

### Last-contact date setter in UI
- Same situation as follow-up date: `lastContactedAt` is stored in the DB
  and shown in the overview tab, but there is no control to update it from
  the UI.

### Tests
- No test files anywhere (no unit tests, no integration tests, no Playwright
  end-to-end tests). There is a `TESTING_CHECKLIST.md` for manual testing
  only.

### Email / notification system
- No email sending, no in-app notifications, no reminders for overdue
  follow-ups.

---

## Risks / weak spots

| # | Risk | Location | Severity |
|---|------|----------|----------|
| 1 | **No rate limiting on `/auth/login`** | `SecurityConfig` | Medium — brute-force is possible; Spring Security does not throttle by default. |
| 2 | **Cookie `secure: false` in docker profile** | `application-docker.yml` | Low for local; must be `true` before any HTTPS deployment. |
| 3 | **`Inter` font loaded from Google Fonts at build time** | `app/layout.tsx` | Low — build fails in air-gapped environments. |
| 4 | **No tests** | entire repo | High — any refactor or migration change is unverified. |
| 5 | **`open-in-view` enabled (JPA lazy load in view)** | default Spring config | Low — generates a WARN on startup; can mask N+1 issues in templates. |
| 6 | **`getAssignableUsers` called separately by FilterBar AND LeadDetail** | `leads/page.tsx`, `leads/[id]/page.tsx` | Low — two round-trips for the same static-ish list; no caching. |
| 7 | **Session secret is the default Spring one** | no explicit `spring.session.store-type` or secret config | Medium — session tokens are not cryptographically keyed to a secret if using in-memory store; acceptable for local but needs a proper store (Redis) in production. |
| 8 | **Hard `window.location.href` redirect on 401** | `client.ts:46` | Low (just patched) — the guard `pathname !== "/login"` prevents the loop, but it is still a full page reload instead of a smooth Next.js navigation. |
| 9 | **`PATCH /leads/{id}` has no authorization check** | `LeadController` | Low — any authenticated user (agent or admin) can edit any lead. No role-based restriction on updates beyond being logged in. |

---

## Next 5 implementation priorities

**1. Rebuild and verify the running Docker stack**
All current blockers are fixed in source. Run `docker compose up --build` and
go through `TESTING_CHECKLIST.md` top to bottom. This is gate-zero — nothing
else should start until the app is confirmed stable.

**2. Add the logout button to `TopBar.tsx`**
One-line call to `logoutUser()` followed by `logout()` context method and
`router.replace("/login")`. The endpoint and context are already wired.
Blocks any real user session from being clearable.

**3. Build the follow-up date setter in lead detail**
A date-picker input on the Overview tab that calls `PATCH /api/v1/leads/{id}`
with `{ nextFollowUpDate }`. The backend already handles it, records
`FOLLOW_UP_SET` activity, and the dashboard "Vencen hoy / Vencidos" cards
depend on this field being populated. Without a UI setter, those cards will
always show zero for real usage.

**4. Build the edit lead form**
The `PATCH /api/v1/leads/{id}` endpoint is complete. A simple edit page at
`/leads/[id]/edit` (or a modal) that pre-populates all fields and submits a
partial update would unlock the ability to correct contact info, budget, and
property preferences — essential for day-to-day CRM use.

**5. Add at least one integration test per critical path**
Minimum: a Spring Boot test that starts the full context against a real
Testcontainers PostgreSQL instance and exercises login → create lead →
change status → add note. This prevents the class of migration bugs
(the `::jsonb` cast) and annotation bugs (`@BatchSize`) from ever silently
breaking the stack again.

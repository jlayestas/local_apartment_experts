# CRM Internal App — Technical Status Report

**Date:** 2026-04-14  
**Reviewer role:** Technical reviewer — based entirely on actual code present in the repository  
**Scope:** Backend (Java / Spring Boot / PostgreSQL) + Frontend (Next.js / React / TypeScript / Tailwind)

---

## 1. Working Now

### Backend

| Area | What works |
|---|---|
| **Auth** | Login (`POST /auth/login`), session cookie (`CRM_SESSION`), current user (`GET /auth/me`), logout via Spring Security filter |
| **Leads CRUD** | Create, paginated list (all filters), get by ID, partial update |
| **Lead workflow** | Status change with validation and activity logging, agent assignment with activity logging |
| **Lead notes** | Add note, list notes per lead — both endpoints wired, activity recorded |
| **Lead activity timeline** | Full timeline per lead with all recorded types, ordered by date DESC |
| **Lead-property linking** | List links, create link (with uniqueness validation), update link type or note |
| **Lead search & filtering** | `search`, `status`, `assignedUserId`, `source`, `followUpDue`, `createdFrom`, `createdTo`, `page`, `size` — all work |
| **Properties CRUD** | Create, paginated list (all filters), get by ID, partial update |
| **Property lifecycle** | Publish (DRAFT→PUBLISHED), unpublish (PUBLISHED→DRAFT), archive (any→ARCHIVED) — state transitions, timestamps, activity records all correct |
| **Property search & filtering** | `search`, `status`, `featured`, `city`, `neighborhood`, `minPrice`, `maxPrice`, `bedrooms`, `propertyType`, `page`, `size` |
| **Property images** | Upload (multipart, JPEG/PNG/WebP, 10 MB limit), list, delete, set cover, reorder — all five endpoints |
| **Local file storage** | `LocalStorageService` saves files to `./uploads/`, serves them at `/uploads/**` (public, no auth required) |
| **Public API** | `GET /public/properties` (paginated, PUBLISHED only), `GET /public/properties/{slug}` — no auth required |
| **Dashboard** | Summary stats (new leads, unassigned, due today, overdue), recent leads list |
| **Users** | `GET /users/assignable` — list active users for dropdowns |
| **Activity recording** | 14 activity types recorded: all lead events + all property lifecycle events + property-link events |
| **Exception handling** | `ResourceNotFoundException` → 404, `BusinessException` → 400, validation → 400 with field errors, generic → 500 |
| **Security** | Session-based auth, CSRF mitigated via SameSite=Strict cookie, CORS restricted to configured origin, all `/api/v1/**` routes protected except login and `/public/**` |

### Frontend

| Area | What works |
|---|---|
| **Auth flow** | Login page, session cookie handled, redirect on 401, logout |
| **Layout / nav** | App shell with sidebar (Dashboard, Prospectos, Propiedades), active state, responsive |
| **Dashboard** | Summary cards (4 stats), recent leads table with status badges |
| **Leads list** | Paginated table, filters (search, status, agent, source, follow-up due), pagination controls, row click navigates to detail |
| **Lead create** | Full form with all fields, required field validation, agent dropdown populated from API |
| **Lead detail — Overview** | Contact, property preferences, assignment, inline-editable follow-up and last-contact dates (auto-save on blur) |
| **Lead detail — Notes** | Add note form, notes list with author + timestamp |
| **Lead detail — Activity** | Activity timeline with human-readable descriptions and metadata rendering |
| **Lead detail — Properties tab** | List linked properties, inline link-type change (dropdown), note add/edit, "Vincular propiedad" search panel |
| **Lead edit** | Full pre-populated form, all fields editable, saves via PATCH |
| **Lead header actions** | Inline status dropdown, inline agent dropdown — both save on change |
| **Properties list** | Paginated table with filters (search, status, type, featured), row click navigates to detail |
| **Property create** | Full form (7 sections: content, location, pricing, details, policies, contact, sourcing), agent dropdown |
| **Property detail — Overview** | Images section + location, pricing, details, policies, contact, description, internal notes |
| **Property detail — Images** | Upload zone (click or drag-drop), image grid with cover badge, hover overlay (reorder arrows, set cover, delete), optimistic reorder with rollback |
| **Property detail — Status actions** | Publish, unpublish, archive buttons depending on current status |
| **Property edit** | Full pre-populated form, all fields editable |
| **Translation layer** | All user-visible strings go through `useTranslations()` / `es.ts` — statuses, types, labels, actions all in Spanish |
| **Error + loading states** | Spinner, error messages with retry, empty states on all list views |
| **Docker Compose** | `docker compose up --build` works end-to-end; `uploads_data` volume persists images across restarts |

---

## 2. Partially Working

### `removeLeadPropertyLink` — **broken end-to-end**

The frontend sends `DELETE /api/v1/leads/{leadId}/properties/{linkId}`. The backend has no `@DeleteMapping` on `LeadPropertyLinkController` and no `delete()` method in `LeadPropertyLinkService`. Every unlink attempt returns HTTP 405. The "Desvincular" button in the UI exists and fires the call but always silently fails.

### `LinkType` enum — **name mismatch blocks linking entirely**

The backend defines `LeadPropertyLinkType { SUGGESTED, INTERESTED, TOURED, REJECTED }`. The frontend `LinkType` type and all UI code use `"SUGERIDA" | "INTERESADO" | "VISITADA" | "RECHAZADA"`. The `es.ts` translation map also keys on the Spanish names.

When the frontend sends `linkType: "SUGERIDA"` the backend will reject it (400 or enum parse error). When the backend returns `linkType: "SUGGESTED"` the frontend translation lookup `t.properties.linkType["SUGGESTED"]` returns `undefined` and renders blank. The **entire lead-property linking feature is broken** in any real backend connection.

### Property activity tab

The tab renders but shows the stub message "Sin actividad registrada" unconditionally. The backend records 5 property activity types (`PROPERTY_CREATED`, `PROPERTY_UPDATED`, `PROPERTY_PUBLISHED`, `PROPERTY_UNPUBLISHED`, `PROPERTY_ARCHIVED`) but `ActivityController` only exposes `GET /leads/{leadId}/activities`. There is no `GET /properties/{propertyId}/activities` endpoint. The frontend has no API call for property activity.

### `internalNotes` on property detail

The `PropertyDTO` intentionally omits `internalNotes` (comment in source: "Add InternalPropertyDTO when admin endpoints need it"). The field exists in the DB and is accepted on create/update, but is **never returned by any endpoint**, including to authenticated internal users. The detail page has UI to display it but will never receive the data.

### Hardcoded Spanish strings

A handful of labels bypass the translation layer and are hardcoded in JSX:
- `/properties/[id]/page.tsx`: "Dirección", "Coordenadas", "Teléfono", "WhatsApp", "Descripción"
- `/properties/[id]/_components/ImagesSection.tsx`: `title="Mover izquierda"`, `title="Mover derecha"`

These are cosmetic but break full i18n coverage.

---

## 3. Missing

### CRM v1

| Feature | Notes |
|---|---|
| **Delete / hard-remove a lead** | No DELETE endpoint. Only soft-archive via status change. May be intentional for audit trail, but no documented decision. |
| **Delete a note** | Notes can only be added. No endpoint to remove or edit a note. |
| **Admin-only endpoints** | No role-based access control enforced on any endpoint. `@EnableMethodSecurity` is declared in `SecurityConfig` but no `@PreAuthorize`/`@Secured` annotations are used anywhere. Any authenticated user (AGENT or ADMIN) can do anything. |
| **Password change / user management** | No endpoint for users to change their own password. No admin user-management UI. |
| **Lead deduplication** | No duplicate detection on email or phone when creating leads. |
| **Bulk operations** | No bulk-assign, bulk-status-change, bulk-delete on leads. |
| **CSV / export** | No export of leads or properties. |

### Properties v1

| Feature | Notes |
|---|---|
| **`internalNotes` exposed to internal users** | Field stored but never returned by the API. Internal agents cannot see it in the UI despite being able to set it. |
| **Property activity endpoint** | `GET /properties/{id}/activities` does not exist. Activity tab is permanently empty. |
| **Property image `updated_at`** | `PropertyImageDTO` exposes `updatedAt` but the `property_images` table has no `updated_at` column (only `created_at`). This is a mapping error — the DTO will cause a runtime error or return null. |
| **Alt-text input in upload UI** | `uploadPropertyImage()` accepts an `altText` parameter, `UploadZone` accepts `altText` as a prop, but the `UploadZone` UI renders no text field for the user to enter it. Alt text is always `null`. |
| **Image count limit** | No maximum number of images per property enforced (backend or frontend). |
| **Storage key missing from DB** | `LocalStorageService` sets both `storageKey` and `imageUrl`. The `property_images` schema has a `storage_key` column, but `PropertyImageDTO` does not expose it (intentional). This is correct but means if `imageUrl` is lost the file cannot be recovered by ID. Low risk for now. |

### Infrastructure / ops

| Feature | Notes |
|---|---|
| **S3 / cloud storage** | `StorageService` interface is ready. `LocalStorageService` is the only implementation. The swap requires a new `@Profile("prod")` bean — not yet written. |
| **Production secrets management** | `application-prod.yml` references `${DB_URL}`, `${DB_USERNAME}`, `${DB_PASSWORD}`, `${CORS_ALLOWED_ORIGINS}` as env vars. No `.env.example` or documentation on required vars. |
| **Email notifications** | No email sending of any kind (lead notifications, assignment alerts, follow-up reminders). |
| **Rate limiting** | No rate limiting on any endpoint, including login. |

---

## 4. Current Pages and User Actions

### `/login`
Employee enters email and password. On success the session cookie is set and they are redirected to `/dashboard`. On failure a Spanish error message appears. No "forgot password" link.

### `/dashboard`
Read-only summary: 4 stat cards (nuevos prospectos, sin agente, vencen hoy, vencidos). Table of the 5 most recent leads with status badge. "Ver todos" link goes to `/leads`.

### `/leads`
Table of all leads with columns: name, email, phone, status badge, source, urgency badge, assigned agent, follow-up date, created date. Filters: full-text search (name/email/phone), status dropdown, agent dropdown, source dropdown, "follow-up vencido" checkbox. Clicking a row navigates to `/leads/{id}`. "+ Nuevo prospecto" button goes to `/leads/new`.

### `/leads/new`
Form with 3 sections (contact, property preferences, other data). Required: first name, last name. Optional: all other fields. Submit creates lead → redirects to `/leads/{id}`.

### `/leads/[id]`
Four-tab detail page:

- **Resumen:** Read-only contact info + property preferences. Inline date pickers for next follow-up and last contact (auto-save on blur). Header has inline status dropdown and inline agent assignment dropdown.
- **Notas:** Text area to add a note. List of past notes (oldest to newest by creation). No edit or delete.
- **Actividad:** Full audit timeline. Activity types translated to Spanish. Status changes show from → to. Assignments show assignee name.
- **Propiedades:** List of linked properties as cards (title, location, type, price, link-type selector). Inline note field. "Vincular propiedad" opens a debounced search panel to find and link properties. "Desvincular" button exists but **fails** (see section 2).

Header: "Editar" button links to edit form. Inline status and agent dropdowns save on change.

### `/leads/[id]/edit`
Pre-populated form identical in structure to `/leads/new`. Save → PATCH → redirects to detail page.

### `/properties`
Table of all properties with columns: title, location (neighborhood + city), type, bed count, price, status badge, featured star, created date. Filters: full-text search, status, property type, featured checkbox. Row click navigates to `/properties/{id}`. "+ Nueva propiedad" goes to `/properties/new`.

### `/properties/new`
Full form with 7 sections: content (title, slug, description, internal notes), location (address, neighborhood, city, state, zip), pricing (price, frequency), details (type, beds, baths, sq ft, available date, featured checkbox), policies (amenities, pet policy, parking), contact (agent, phone, WhatsApp), sourcing (source company, external ref ID). Submit → creates property as DRAFT → redirects to `/properties/{id}`.

### `/properties/[id]`
Two-tab detail page:

- **Resumen:** Images section at top (gallery grid + upload zone). Below: location, pricing, details, policies, contact info sections. Description and internal notes sections appear if set. **Note:** internal notes will always be empty because the backend API strips them.
- **Actividad:** Permanently shows "Sin actividad registrada" — stub, never loads real data.

Header: property title, status badge, featured star. "Editar" button. Status action buttons (Publicar / Despublicar / Archivar depending on current status).

### `/properties/[id]/edit`
Pre-populated form identical in structure to `/properties/new`. Save → PATCH → redirects to detail page.

---

## 5. Current API Coverage

### Auth
| Method | Path | Notes |
|---|---|---|
| POST | `/api/v1/auth/login` | Public |
| GET | `/api/v1/auth/me` | Protected |
| POST | `/api/v1/auth/logout` | Spring Security filter |

### Leads
| Method | Path | Notes |
|---|---|---|
| POST | `/api/v1/leads` | Create |
| GET | `/api/v1/leads` | Paginated list, all filters |
| GET | `/api/v1/leads/{id}` | Detail |
| PATCH | `/api/v1/leads/{id}` | Partial update |
| POST | `/api/v1/leads/{id}/status` | Change status |
| POST | `/api/v1/leads/{id}/assign` | Assign agent |
| GET | `/api/v1/leads/{id}/notes` | List notes |
| POST | `/api/v1/leads/{id}/notes` | Add note |
| GET | `/api/v1/leads/{id}/activities` | Activity timeline |
| GET | `/api/v1/leads/{id}/properties` | List linked properties |
| POST | `/api/v1/leads/{id}/properties` | Link a property |
| PATCH | `/api/v1/leads/{id}/properties/{linkId}` | Update link |
| ~~DELETE~~ | ~~`/api/v1/leads/{id}/properties/{linkId}`~~ | **Missing — 405 in prod** |

### Properties (internal)
| Method | Path | Notes |
|---|---|---|
| POST | `/api/v1/properties` | Create |
| GET | `/api/v1/properties` | Paginated list, all filters |
| GET | `/api/v1/properties/{id}` | Detail (strips internalNotes) |
| PATCH | `/api/v1/properties/{id}` | Partial update |
| POST | `/api/v1/properties/{id}/publish` | DRAFT → PUBLISHED |
| POST | `/api/v1/properties/{id}/unpublish` | PUBLISHED → DRAFT |
| POST | `/api/v1/properties/{id}/archive` | any → ARCHIVED |
| GET | `/api/v1/properties/{id}/images` | List images |
| POST | `/api/v1/properties/{id}/images` | Upload image (multipart) |
| DELETE | `/api/v1/properties/{id}/images/{imageId}` | Delete image |
| PATCH | `/api/v1/properties/{id}/images/{imageId}/cover` | Set cover |
| PUT | `/api/v1/properties/{id}/images/reorder` | Reorder gallery |

### Properties (public)
| Method | Path | Notes |
|---|---|---|
| GET | `/api/v1/public/properties` | PUBLISHED listings, no auth |
| GET | `/api/v1/public/properties/{slug}` | PUBLISHED by slug, no auth |

### Other
| Method | Path | Notes |
|---|---|---|
| GET | `/api/v1/users/assignable` | Active users for dropdowns |
| GET | `/api/v1/dashboard/summary` | 4 summary stats |
| GET | `/api/v1/dashboard/recent-leads` | Recent 5 leads |

### Notable missing endpoints
- `DELETE /api/v1/leads/{id}/properties/{linkId}` — unlink property from lead
- `GET /api/v1/properties/{id}/activities` — property activity timeline
- Any `DELETE /api/v1/leads/{id}` — hard delete a lead
- Any `/api/v1/users/**` management endpoints beyond the assignable list
- Any `/api/v1/leads/{id}/notes/{noteId}` DELETE — delete a note

---

## 6. Current Database Coverage

| Table | Entity | Currently used for |
|---|---|---|
| `users` | `User` | Authentication, agent assignment, activity actor tracking |
| `leads` | `Lead` | Core CRM record — all contact, preference, and status data |
| `lead_notes` | `LeadNote` | Free-text notes attached to a lead, append-only |
| `lead_status_history` | `LeadStatusHistory` | Full status transition audit trail (every change recorded) |
| `lead_assignments` | `LeadAssignment` | Full assignment history (not just current; every reassignment recorded) |
| `activities` | `Activity` | Unified append-only event log for both leads and properties |
| `properties` | `Property` | Property listings with all content, location, pricing, and lifecycle fields |
| `property_images` | `PropertyImage` | Image gallery per property with ordering and cover flag |
| `lead_property_links` | `LeadPropertyLink` | Many-to-many join between leads and properties with link type and note |

### Missing schema pieces

None — all 9 tables in the Flyway migrations have corresponding Java entities. The schema is complete for v1 scope.

One inconsistency: `PropertyImageDTO` exposes an `updatedAt` field but `property_images` has no `updated_at` column. The DTO will return `null` at runtime for this field (or cause a mapping error depending on Hibernate version). This should be removed from the DTO.

---

## 7. Release Blockers / Weak Spots

### Critical — blocks demo today

**1. `LinkType` enum mismatch**  
Backend: `SUGGESTED`, `INTERESTED`, `TOURED`, `REJECTED`  
Frontend: `"SUGERIDA"`, `"INTERESADO"`, `"VISITADA"`, `"RECHAZADA"`  
The frontend sends Spanish-named values the backend rejects, and displays English-named values from the backend as blank strings. The entire lead-property linking module is broken at the API boundary. Fix: align both to the backend enum names and update the `es.ts` translation map keys accordingly.

**2. Missing DELETE for lead-property links**  
The "Desvincular" button exists in the UI, calls `DELETE /leads/{id}/properties/{linkId}`, and always gets a 405. Every unlink attempt silently fails. Fix: add `@DeleteMapping("/{linkId}")` and a `delete()` service method.

### High — degrades usability significantly

**3. `internalNotes` never returned**  
Agents can write internal notes on properties via the create/edit forms, but the field is deliberately stripped from `PropertyDTO`. The internal notes section on the property detail page is always blank. Either expose the field to authenticated users via a separate DTO/endpoint, or remove it from the forms to avoid confusing agents.

**4. Property activity tab is a permanent stub**  
The "Actividad" tab on every property shows "Sin actividad registrada" regardless of how much activity exists in the database. Add `GET /properties/{id}/activities` endpoint and wire it to the frontend.

**5. No role enforcement**  
Any authenticated user can archive properties, access internal notes, change any lead's agent, and perform any action. The `@EnableMethodSecurity` annotation is declared but no `@PreAuthorize` annotations exist on any method. For an internal tool with only trusted employees this is lower risk, but it should be documented as a known gap.

### Medium — production risk

**6. `PropertyImageDTO.updatedAt` references a non-existent column**  
The DTO exposes `updatedAt` but `property_images` has no such column. At runtime this will either return `null` or throw a mapping exception. Needs to be removed from the DTO.

**7. Uploaded images lost if container is replaced without the volume**  
Local file storage works correctly with the `uploads_data` Docker volume but is not resilient to volume deletion or instance replacement. There is no S3 implementation yet. For any real deployment, this must be resolved before going live.

**8. No login rate limiting**  
`POST /auth/login` is public and unthrottled. Brute-force credential attacks have no mitigation beyond BCrypt cost. Acceptable for a closed internal tool; unacceptable if the login URL is publicly reachable.

**9. HTTPS not enforced**  
`secure: false` on the session cookie in `application.yml`. The production config switches this to `true`, which requires HTTPS. If deployed without TLS the session cookie is sent in plaintext.

### Low — polish / UX gaps

**10. Alt text always null for uploaded images**  
The backend, API function, and component all support `altText`, but the `UploadZone` renders no text field for the user to enter it. Every image is uploaded without alt text, which affects accessibility and SEO on the public website.

**11. No feedback after failed unlink**  
When "Desvincular" fails (404/405), the error is caught silently (`catch { }` with no `setError` call). The button appears to do nothing. An error message should be shown.

**12. No maximum image count per property**  
Agents can upload unlimited images. No guard on the backend (`countByPropertyId` is used only to set `sortOrder`, not to enforce a limit).

---

## 8. Top 7 Next Priorities

Listed in order of value-to-effort, focused on making v1 shippable.

### 1. Fix the `LinkType` enum mismatch

**Impact:** The entire lead-property linking feature is broken in any real environment.  
**Work:** Change frontend `LinkType` to `"SUGGESTED" | "INTERESTED" | "TOURED" | "REJECTED"`. Update `es.ts` keys: `SUGGESTED → "Sugerida"`, `INTERESTED → "Interesado"`, `TOURED → "Visitada"`, `REJECTED → "Rechazada"`. Update `LINK_TYPES` arrays in `PropertiesTab.tsx`. No backend change needed.  
**Estimate:** 30 minutes.

### 2. Add DELETE for lead-property links

**Impact:** Agents cannot unlink a wrongly-linked property.  
**Work (backend):** Add `delete(UUID leadId, UUID linkId, String actorEmail)` to `LeadPropertyLinkService` (verify ownership, call `linkRepository.deleteById()`, optionally record activity). Add `@DeleteMapping("/{linkId}")` to `LeadPropertyLinkController`.  
**Work (frontend):** Add `setError` call in the `catch` block of `handleRemove` in `LinkCard`.  
**Estimate:** 1–2 hours.

### 3. Expose `internalNotes` to authenticated internal users

**Impact:** Agents write notes they can never read back.  
**Work:** Create `InternalPropertyDTO extends PropertyDTO` with `internalNotes` added (or simply add it to `PropertyDTO` behind a comment). Update `PropertyService.getById()` to include the field. No DB change.  
**Estimate:** 1 hour.

### 4. Fix `PropertyImageDTO.updatedAt` mapping error

**Impact:** Latent runtime error. Any future Hibernate version bump could surface it.  
**Work:** Remove `updatedAt` from `PropertyImageDTO` record. Update frontend `PropertyImage` type to remove `updatedAt`. Verify no code reads it.  
**Estimate:** 15 minutes.

### 5. Add property activity endpoint and wire the frontend tab

**Impact:** The activity tab on every property is a dead stub.  
**Work (backend):** Add `GET /api/v1/properties/{id}/activities` to `ActivityController` (or a dedicated `PropertyActivityController`) — query `activityRepository.findByPropertyIdOrderByCreatedAtDesc(id)`.  
**Work (frontend):** Replace stub `ActivityTab` in `properties/[id]/page.tsx` with a real component that calls the new endpoint (can reuse the lead ActivityTab pattern almost verbatim).  
**Estimate:** 2–3 hours.

### 6. Add alt-text input to the image upload flow

**Impact:** Every uploaded image has no alt text — SEO and accessibility gap for the public website.  
**Work:** Replace the `UploadZone` click-to-select with a two-step flow: select file → show preview + alt text input → confirm upload. Alternatively, add an inline edit on each `ImageCard` to set alt text post-upload via `PATCH /{imageId}` (requires a new patch endpoint for alt text — currently `setCover` is the only PATCH).  
**Estimate:** 2–3 hours.

### 7. Add a production-ready storage implementation

**Impact:** Local file storage cannot survive instance replacement. Required before any real deployment.  
**Work:** Write `S3StorageService implements StorageService` annotated `@Profile("prod")`. Read `AWS_BUCKET`, `AWS_REGION`, `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY` from environment. Add AWS S3 SDK dependency to `pom.xml`. Update `application-prod.yml` with `app.storage.base-url` pointing to the bucket or CDN domain. `LocalStorageService` stays for dev with zero code changes to callers.  
**Estimate:** 3–4 hours.

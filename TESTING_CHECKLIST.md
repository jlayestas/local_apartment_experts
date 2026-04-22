# CRM v1 — Testing Checklist

Use this checklist after running the full Docker stack (`docker compose up --build`).
Check each item manually. Mark ✅ pass or ❌ fail with a short note.

---

## 1. Authentication

- [ ] **Login — happy path**: enter admin credentials → redirected to dashboard
- [ ] **Login — wrong password**: enter bad password → error message shown (not a crash)
- [ ] **Login — wrong email**: enter unknown email → same generic error (does not reveal whether the user exists)
- [ ] **Login — empty fields**: submit empty form → browser validation prevents submit
- [ ] **Protected route**: open http://localhost:3000/dashboard without a session → redirected to /login
- [ ] **Protected route**: open http://localhost:3000/leads without a session → redirected to /login
- [ ] **Logout**: click logout in the top bar → redirected to /login, session cleared
- [ ] **Session persistence**: log in, refresh the page → still logged in (session cookie survives a reload)

---

## 2. Dashboard

- [ ] **Summary cards load**: four cards visible (Nuevos prospectos, Sin agente, Vencen hoy, Vencidos)
- [ ] **Counts are non-zero**: all four cards should show > 0 with the demo data
- [ ] **Recent leads table**: shows up to 10 leads with Name, Status, Urgency, Agent, Created columns
- [ ] **Lead name is a link**: clicking a name in the recent leads table navigates to /leads/[id]
- [ ] **"Ver todos" link**: navigates to /leads list

---

## 3. Leads List

### Table
- [ ] **All 8 columns visible**: Nombre, Teléfono, Email, Origen, Estado, Agente, Seguimiento, Creado
- [ ] **Sorted newest-first**: most recently created lead is at the top
- [ ] **Row click navigates**: clicking anywhere on a row goes to /leads/[id]
- [ ] **Overdue follow-up dates in red**: leads with past follow-up dates show the date in red
- [ ] **Today's follow-up in red**: follow-up date = today also appears in red
- [ ] **Unassigned shows "—"**: leads with no agent show a dash in the Agente column
- [ ] **Missing email/phone shows "—"**: leads without email or phone show a dash

### Filters
- [ ] **Search by first name**: type "Ana" → only Ana Martínez shows
- [ ] **Search by last name**: type "García" → filters correctly
- [ ] **Search by email**: type "sofia.diaz" → filters correctly
- [ ] **Search by phone**: type "5512345016" → filters correctly
- [ ] **Search commits on Enter**: typing alone does not filter — pressing Enter or clicking Buscar does
- [ ] **Status filter**: select "Calificado" → only QUALIFIED leads show
- [ ] **Agent filter**: select "María García Hernández" → only her leads show
- [ ] **Source filter**: select "Facebook" → only FACEBOOK leads show
- [ ] **Follow-up due checkbox**: check it → only leads with overdue/today follow-ups in open statuses show
- [ ] **Clear filters button**: appears only when at least one filter is active
- [ ] **Clear filters**: clicking it resets all filters and shows all leads

### Pagination
- [ ] **Pagination controls appear**: with 25 leads and page size 20, page controls should appear
- [ ] **Next page works**: clicking "Siguiente" loads page 2
- [ ] **Previous page works**: clicking "Anterior" returns to page 1
- [ ] **Result count shows**: "25 resultados" shown at the bottom left

---

## 4. Create Lead

- [ ] **Form loads**: /leads/new shows three sections (Información de contacto, Preferencias de propiedad, Otros datos)
- [ ] **Required field validation**: submit with empty Nombre → error shown under the field
- [ ] **Required field validation**: submit with empty Apellido → error shown under the field
- [ ] **Optional fields optional**: submit with only Nombre + Apellido filled → succeeds
- [ ] **Agent dropdown populated**: "Asignar a agente" dropdown shows María García and Carlos López
- [ ] **Successful create**: fill form and submit → redirected to the new lead's detail page
- [ ] **Cancel button**: click "Cancelar" → returns to previous page without creating a lead
- [ ] **Duplicate check (manual)**: the new lead appears at the top of /leads list

---

## 5. Lead Detail — Header & Overview Tab

- [ ] **Header shows name**: lead's full name shown as h1
- [ ] **Status badge visible**: colored badge matching the lead's status
- [ ] **Urgency badge visible**: colored badge matching urgency level
- [ ] **Source badge visible**: shows when source is set
- [ ] **Last updated shown**: timestamp displayed under the name

### Overview tab
- [ ] **Contact section**: email, phone, WhatsApp, preferred contact method, language displayed
- [ ] **Property section**: budget range, bedrooms/bathrooms, move-in date, neighborhoods shown
- [ ] **Assignment section**: assigned agent name shown (or "Sin asignar" if unassigned)
- [ ] **Follow-up date**: shown when set (or "Sin fecha programada")
- [ ] **Last contact date**: shown when set

---

## 6. Lead Detail — Status Change

- [ ] **Status dropdown shows all 9 statuses**: verify the full list in the dropdown
- [ ] **Change status**: select a new status → spinner shows briefly → badge updates immediately
- [ ] **Terminal status guard**: open a CLOSED_WON or CLOSED_LOST lead → status dropdown interaction shows an error (cannot transition out of terminal)

---

## 7. Lead Detail — Agent Assignment

- [ ] **Assign dropdown populated**: shows all active agents
- [ ] **Assign lead**: select an agent → spinner shows briefly → overview tab updates with new agent name
- [ ] **Re-assign**: change to a different agent → updates correctly

---

## 8. Lead Detail — Notes Tab

- [ ] **Notes tab click**: switches to notes view
- [ ] **Existing notes visible**: leads seeded with notes (Sandra, Diego, Sofía, Pablo, Eduardo) show them in reverse chronological order
- [ ] **Empty state**: a lead with no notes shows "Sin notas todavía"
- [ ] **Save button disabled when empty**: textarea empty → "Guardar nota" button is disabled
- [ ] **Add note**: type text → click "Guardar nota" → note appears at top of list immediately
- [ ] **Note shows author and timestamp**: author name and formatted date visible on each note

---

## 9. Lead Detail — Activity Tab

- [ ] **Activity tab click**: switches to activity timeline
- [ ] **LEAD_CREATED entry**: every lead has at least one entry showing lead creation
- [ ] **Status change entries**: leads with multiple status changes show each transition (e.g. "Estado cambiado: Nuevo → Contactado")
- [ ] **Assignment entries**: assigned leads show "Asignado: [agent name]" activity
- [ ] **Note added entries**: leads with notes show "Nota agregada" activity
- [ ] **Actor and timestamp**: each activity shows who did it and when

---

## 10. UI States

- [ ] **Loading spinners**: navigating to any page briefly shows a spinner before content loads
- [ ] **Error + retry**: disconnect backend (stop docker backend service) and refresh a page → error message and retry button appear
- [ ] **Retry works**: restart backend, click retry → content loads correctly

---

## 11. General UI

- [ ] **All text in Spanish**: no English UI strings visible anywhere
- [ ] **Navigation links work**: "Panel" and "Prospectos" in the sidebar navigate correctly
- [ ] **"Nuevo prospecto" button**: on /leads page navigates to /leads/new
- [ ] **Back button**: on /leads/[id] the "← Volver" link returns to the previous page
- [ ] **Responsive — mobile (375px)**: resize browser to 375px width — no horizontal overflow on dashboard and leads list
- [ ] **Responsive — tablet (768px)**: summary cards stack to 2 columns, table scrolls horizontally

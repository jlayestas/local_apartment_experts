# Runbook

## Dev mode (fastest iteration)

Requires: Java 21, Maven, Node 22, Docker

```bash
# 1 — start the database
cd backend
docker compose up -d

# 2 — start the backend  (new terminal)
cd backend
./mvnw spring-boot:run

# 3 — start the frontend  (new terminal)
cd frontend
npm install        # first time only
npm run dev
```

Open: http://localhost:3000
Login: admin@localapartmentexperts.com / Admin1234!

---

## Full Docker stack (visual testing with demo data)

Requires: Docker

```bash
# From the project root (local_apartment_experts/)

# First time — build and start everything
docker compose up --build

# After the first build — start without rebuilding
docker compose up

# Stop everything
docker compose down

# Reset everything (wipe the database)
docker compose down -v
docker compose up --build
```

Open: http://localhost:3000
Login: admin@localapartmentexperts.com / Admin1234!

Demo agents also available:
- maria.garcia@crm.com / Agent1234!
- carlos.lopez@crm.com / Agent1234!

---

## Useful commands

```bash
# Tail backend logs
docker compose logs -f backend

# Tail frontend logs
docker compose logs -f frontend

# Connect to the database
docker compose exec db psql -U crm_user -d crm_dev

# Rebuild only one service
docker compose up --build backend
```

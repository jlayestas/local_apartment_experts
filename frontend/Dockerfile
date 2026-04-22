# ── Stage 1: install dependencies ─────────────────────────────────────────────
FROM node:22-alpine AS deps
WORKDIR /app
COPY package*.json ./
RUN npm ci

# ── Stage 2: build ────────────────────────────────────────────────────────────
FROM node:22-alpine AS builder
ARG API_URL=http://localhost:8080
ENV API_URL=$API_URL
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

# ── Stage 3: minimal runtime ──────────────────────────────────────────────────
FROM node:22-alpine
WORKDIR /app
ENV NODE_ENV=production

COPY --from=builder /app/.next ./.next
COPY --from=builder /app/node_modules ./node_modules
COPY package.json ./
COPY next.config.ts ./

EXPOSE 3000
CMD ["npm", "start"]

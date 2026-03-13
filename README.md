# Smart Transport Management System (STMS)

A complete full-stack web application with role-based transport workflow:

- Customer: create bookings, view history, pay invoices
- Owner: approve/reject bookings, generate invoices, monitor payments
- Driver: view assigned trips

## Tech Stack

- Frontend: React + Vite + Axios + React Router
- Backend: Node.js + Express + JWT + bcrypt + Prisma
- Database: PostgreSQL (auto-started via Docker Compose)

## Project Structure

```text
STMS_FullStack
+-- backend/
+-- frontend/
+-- docker-compose.yml
+-- package.json
+-- README.md
```

## Prerequisites

- Node.js 18+
- Docker Desktop (running)

## Run In 2 Commands

From project root:

```bash
npm install
npm run dev
```

That single `npm run dev` command will automatically:

- create `backend/.env` and `frontend/.env` (if missing)
- start PostgreSQL container
- wait for database readiness
- sync Prisma schema to DB
- start backend on `http://localhost:5000`
- start frontend on `http://localhost:5173`

## Stop Database Container

```bash
npm run db:down
```

## Main API Endpoints

- `POST /api/auth/register`
- `POST /api/auth/login`
- `POST /api/bookings`
- `GET /api/bookings/my`
- `GET /api/bookings/pending`
- `PATCH /api/bookings/:id/status`
- `POST /api/invoices/generate`
- `GET /api/invoices/my`
- `POST /api/payments/pay`

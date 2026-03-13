# STMS Project Handoff Report

Last refreshed: March 13, 2026
Project: Smart Transport Management System (STMS)
Active working copy: `D:\Projetcs\STMS_FullStack`
Original copy: `G:\My Drive\TY BSc CS\Projects\STMS`

---

## 1. Handoff Snapshot

This repository is a beginner-friendly full-stack transport workflow app with separate React frontend and Express backend layers, backed by PostgreSQL through Prisma.

The codebase is functionally strong at demo level. The main blocker is environmental, not architectural: Docker Desktop is not installed on the current machine, so the intended one-command local startup cannot finish end to end yet.

| Area | Current State | Notes |
|---|---|---|
| Product scope | `Implemented` | Auth, role dashboards, booking flow, invoicing, payment simulation |
| Local startup UX | `Simplified` | `npm run dev` handles env prep, DB startup, DB sync, backend, frontend |
| End-to-end run on this laptop | `Blocked` | Docker CLI is missing |
| Git sync | `Attention` | `main` is ahead of `origin/main` by 1 commit |
| Test coverage | `Missing` | No automated backend, frontend, or E2E tests |
| Handoff readiness | `Good` | Repo is understandable and continuation path is clear |

### Immediate takeaway

If someone new takes over this project, the first practical goal is simple:

1. Install Docker Desktop.
2. Run `npm install`.
3. Run `npm run dev`.
4. Verify the complete customer -> owner -> invoice -> payment -> driver flow.
5. Push the latest local commit.

---

## 2. Project In One Screen

### What this system does

STMS models a transport logistics workflow across three roles:

- `CUSTOMER` creates bookings and pays invoices
- `OWNER` reviews bookings, assigns drivers, and generates invoices
- `DRIVER` views assigned approved trips

### Architecture map

```mermaid
flowchart LR
    FE["React frontend<br/>Vite + React Router + Axios"] -->|JWT requests| API["Express API<br/>/auth /bookings /invoices /payments /users"]
    API --> AUTH["Auth + role middleware"]
    API --> PRISMA["Prisma Client"]
    PRISMA --> DB["PostgreSQL 16<br/>Docker Compose"]
```

### Core business flow

```mermaid
flowchart LR
    C["Customer signs up or logs in"] --> B["Customer creates booking"]
    B --> O["Owner reviews pending booking"]
    O --> A["Owner approves or rejects"]
    A --> D["Driver assigned manually or automatically"]
    D --> I["Owner generates invoice"]
    I --> P["Customer pays invoice"]
    P --> T["Driver sees assigned trip on dashboard"]
```

---

## 3. Executive Summary

This project was built as a full-stack academic/demo application with a straightforward structure and a simple onboarding path. The implemented system includes:

- user registration and login
- JWT-based authentication
- role-based dashboards for Customer, Owner, and Driver
- booking creation and approval flow
- invoice generation after approval
- payment simulation
- PostgreSQL schema through Prisma
- root-level scripts intended to reduce startup to two commands

The current canonical project location is:

- `D:\Projetcs\STMS_FullStack`

The current bottleneck is environment setup. The app expects Docker Compose to start PostgreSQL automatically, and Docker is not installed on this laptop right now.

---

## 4. Quick Start For The Next Developer

### Intended setup path

From the repo root:

```bash
npm install
npm run dev
```

### What `npm run dev` is designed to do

1. Check that Docker CLI exists.
2. Check that the Docker daemon is running.
3. Create `backend/.env` and `frontend/.env` if they do not already exist.
4. Start PostgreSQL through Docker Compose.
5. Wait for `localhost:5432`.
6. Push the Prisma schema to the database.
7. Start the backend dev server.
8. Start the frontend dev server.

### Expected runtime endpoints

| Service | URL / Port |
|---|---|
| PostgreSQL | `localhost:5432` |
| Backend API | `http://localhost:5000` |
| Frontend app | `http://localhost:5173` |

### Current blocker on this machine

The startup flow currently stops early with this message:

```text
Missing prerequisite: docker CLI. Install Docker Desktop and reopen terminal.
```

---

## 5. Repository State

### Current repository details

| Item | Value |
|---|---|
| Repository path | `D:\Projetcs\STMS_FullStack` |
| Remote | `origin https://github.com/VAIBHAV906766/STMS_FullStack.git` |
| Branch | `main` |
| Latest commits | `fd21ef3`, `d2b76cf`, `4e1147a` |

### Latest commits

1. `fd21ef3` - `Add prereq check for Docker before dev startup`
2. `d2b76cf` - `Build full STMS app and add 2-command monorepo startup`
3. `4e1147a` - `Initial commit`

### Git status at time of this refresh

- local `main` is ahead of `origin/main` by 1 commit
- tracked modified file: `README.md`
- untracked file: `PROJECT_HANDOFF_REPORT.md`

### Practical implication

Before archiving or transferring the repo:

1. Re-check `git status`.
2. Decide whether the `README.md` change is real or just line-ending noise.
3. Add and commit the refreshed handoff report if it should live in version control.
4. Push `main` to `origin`.

---

## 6. Repo Map

### Top-level layout

```text
STMS_FullStack/
|-- backend/
|-- frontend/
|-- scripts/
|-- docker-compose.yml
|-- package.json
|-- package-lock.json
|-- README.md
|-- PROJECT_HANDOFF_REPORT.md
|-- .env.example
|-- .gitignore
`-- .gitattributes
```

### Backend layout

```text
backend/
|-- config/
|   `-- prisma.js
|-- controllers/
|   |-- authController.js
|   |-- bookingController.js
|   |-- invoiceController.js
|   |-- paymentController.js
|   `-- userController.js
|-- middleware/
|   |-- asyncHandler.js
|   |-- authMiddleware.js
|   |-- errorMiddleware.js
|   `-- roleMiddleware.js
|-- prisma/
|   `-- schema.prisma
|-- routes/
|   |-- authRoutes.js
|   |-- bookingRoutes.js
|   |-- invoiceRoutes.js
|   |-- paymentRoutes.js
|   `-- userRoutes.js
|-- package.json
|-- package-lock.json
|-- server.js
|-- .env.example
`-- .env
```

### Frontend layout

```text
frontend/
|-- src/
|   |-- api/
|   |-- components/
|   |-- context/
|   |-- pages/
|   |-- App.jsx
|   |-- main.jsx
|   `-- styles.css
|-- index.html
|-- package.json
|-- package-lock.json
|-- vite.config.js
|-- .env.example
`-- .env
```

### Utility scripts

```text
scripts/
|-- check-prereqs.js
`-- prepare-env.js
```

---

## 7. Technology Stack

| Layer | Tools |
|---|---|
| Frontend | React 18, Vite, React Router DOM, Axios, plain CSS |
| Backend | Node.js, Express, Prisma Client, bcrypt, jsonwebtoken, dotenv, cors |
| Database | PostgreSQL 16 |
| Local orchestration | Docker Compose, npm workspaces, npm-run-all, wait-on |

### Root scripts

| Script | Purpose |
|---|---|
| `npm run check:prereqs` | Verify Docker CLI and daemon |
| `npm run env:prepare` | Copy missing `.env` files from examples |
| `npm run db:up` | Start PostgreSQL container |
| `npm run db:wait` | Wait for port `5432` |
| `npm run db:migrate` | Run `prisma db push --skip-generate` |
| `npm run backend:dev` | Start Express app with nodemon |
| `npm run frontend:dev` | Start Vite dev server |
| `npm run dev` | Full local startup pipeline |

---

## 8. Feature Coverage By Role

| Capability | Customer | Owner | Driver |
|---|---|---|---|
| Register / login | Yes | Yes | Yes |
| View dashboard | Yes | Yes | Yes |
| Create booking | Yes | No | No |
| View own bookings | Yes | No | No |
| Review pending bookings | No | Yes | No |
| Approve / reject bookings | No | Yes | No |
| Assign driver | No | Yes | No |
| View approved assigned trips | No | No | Yes |
| Generate invoices | No | Yes | No |
| View invoices | Yes | Yes | No |
| Pay invoice | Yes | No | No |

### Frontend pages implemented

| Page | Purpose |
|---|---|
| `LoginPage.jsx` | Authenticate existing users |
| `SignupPage.jsx` | Register new users with a role |
| `CustomerDashboard.jsx` | Booking and unpaid invoice overview |
| `OwnerDashboard.jsx` | Pending bookings and invoice overview |
| `DriverDashboard.jsx` | Assigned trip overview |
| `BookingFormPage.jsx` | Customer booking creation |
| `PendingBookingsPage.jsx` | Owner review and driver assignment |
| `InvoicePage.jsx` | Customer invoice list or owner invoice control screen |
| `PaymentPage.jsx` | Customer payment simulation |
| `NotFoundPage.jsx` | Fallback route |

---

## 9. Backend Surface Area

### API route groups

| Route group | Purpose |
|---|---|
| `/api/auth` | Registration and login |
| `/api/bookings` | Booking create/read/update workflow |
| `/api/invoices` | Invoice generation and listing |
| `/api/payments` | Invoice payment |
| `/api/users` | Driver lookup for assignment |
| `/api/health` | Health check |

### Implemented endpoints

| Method | Endpoint | Access | Purpose |
|---|---|---|---|
| `POST` | `/api/auth/register` | Public | Register user |
| `POST` | `/api/auth/login` | Public | Login user |
| `POST` | `/api/bookings` | Customer | Create booking |
| `GET` | `/api/bookings/my` | Customer | View own bookings |
| `GET` | `/api/bookings/pending` | Owner | View pending bookings |
| `GET` | `/api/bookings/approved-uninvoiced` | Owner | View approved bookings waiting for invoice |
| `GET` | `/api/bookings/assigned` | Driver | View assigned trips |
| `PATCH` | `/api/bookings/:id/status` | Owner | Approve or reject booking |
| `POST` | `/api/invoices/generate` | Owner | Create invoice from approved booking |
| `GET` | `/api/invoices/my` | Customer | View own invoices |
| `GET` | `/api/invoices/owner` | Owner | View all invoices |
| `POST` | `/api/payments/pay` | Customer | Pay invoice |
| `GET` | `/api/users/drivers` | Owner | Fetch drivers for assignment dropdown |
| `GET` | `/api/health` | Public | API status check |

### Key backend behaviors

- JWT auth expects `Authorization: Bearer <token>`
- role access is enforced with middleware
- duplicate email signup is blocked
- password hashing is handled with bcrypt
- booking approval can manually assign a driver
- if no driver is chosen during approval, the first available driver is auto-assigned
- invoice generation is blocked if an invoice already exists for the booking
- payment processing updates both `payments` and invoice status inside a DB transaction

---

## 10. Data Model Summary

Prisma schema file:

- `backend/prisma/schema.prisma`

### Enums

| Enum | Values |
|---|---|
| `Role` | `CUSTOMER`, `OWNER`, `DRIVER` |
| `BookingStatus` | `PENDING`, `APPROVED`, `REJECTED` |
| `InvoiceStatus` | `PENDING`, `PAID` |

### Core models

| Model | Important fields | Main relationships |
|---|---|---|
| `User` | `id`, `name`, `email`, `passwordHash`, `role`, `createdAt` | Customer bookings, assigned driver trips, customer invoices |
| `Booking` | `id`, `customerId`, `driverId`, `pickupLocation`, `dropLocation`, `goodsType`, `vehicleType`, `distanceKm`, `status`, `createdAt` | Belongs to customer, optional driver, optional invoice |
| `Invoice` | `id`, `bookingId`, `customerId`, `distanceKm`, `ratePerKm`, `totalAmount`, `status`, `createdAt` | Belongs to booking, belongs to customer, has many payments |
| `Payment` | `id`, `invoiceId`, `amount`, `paymentMode`, `paidAt` | Belongs to invoice |

### Invoice formula

```text
totalAmount = distanceKm * ratePerKm
```

Default `ratePerKm`:

```text
20
```

---

## 11. Environment And Config

### Environment files

| File | Purpose |
|---|---|
| `.env.example` | Root reference for backend and frontend expectations |
| `backend/.env.example` | Backend runtime config template |
| `frontend/.env.example` | Frontend runtime config template |
| `backend/.env` | Auto-generated if missing |
| `frontend/.env` | Auto-generated if missing |

### Backend example values

```env
PORT=5000
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/stms_db?schema=public"
JWT_SECRET="change_this_to_a_secure_secret"
FRONTEND_URL="http://localhost:5173"
```

### Frontend example value

```env
VITE_API_URL="http://localhost:5000/api"
```

### Supporting setup files

| File | Responsibility |
|---|---|
| `docker-compose.yml` | Starts PostgreSQL 16 container with persistent volume |
| `scripts/check-prereqs.js` | Verifies Docker CLI and daemon before startup |
| `scripts/prepare-env.js` | Copies example env files when local env files are missing |

---

## 12. Validation Completed So Far

### Verified successfully

- root `npm install`
- backend `npm install`
- frontend `npm install`
- Prisma client generation
- backend syntax checks via `node --check`
- frontend production build via `vite build`

### Not yet verified on the current machine

- full DB + backend + frontend run together
- complete manual role-based happy path flow

### Why it is not yet fully verified

- Docker is not installed on this laptop
- the current startup scripts depend on Docker Compose to bring up PostgreSQL

---

## 13. Problems Encountered During Development

### A. `G:` drive install instability

Symptoms included:

- `TAR_BAD_ARCHIVE`
- `EBADF`
- tar extraction and write failures
- npm cache corruption warnings

Likely cause:

- running npm installs from `G:` synced storage

Resolution:

- project was moved to a local path
- the current working copy was stabilized at `D:\Projetcs\STMS_FullStack`

### B. Contaminated folder on `D:`

An earlier copy into `D:\Projetcs\STMS` mixed with unrelated files.

Resolution:

- a clean directory was created
- active working directory became `D:\Projetcs\STMS_FullStack`

### C. Startup failure despite correct commands

Expected commands were already correct:

```bash
npm install
npm run dev
```

Root cause:

- missing Docker installation, not broken npm script wiring

Resolution:

- `scripts/check-prereqs.js` was added so the failure is explicit and early

### D. Partial cleanup of old `G:` project folder

Action already taken:

- project contents were removed from `G:\My Drive\TY BSc CS\Projects\STMS`

Remaining issue:

- locked `.git` folder remained during the earlier session

Expected final cleanup after locks are gone:

```cmd
rmdir /s /q "G:\My Drive\TY BSc CS\Projects\STMS"
```

---

## 14. Current Limitations And Risk Areas

| Area | Status | Detail |
|---|---|---|
| Signup security | `Weak for production` | Public signup currently allows `OWNER` and `DRIVER` roles |
| Schema evolution | `Simplified` | Root startup uses `prisma db push` instead of versioned migration-first workflow |
| Testing | `Missing` | No automated backend, frontend, or E2E tests |
| Seed data | `Missing` | No seed script for quick demo setup |
| Deployment | `Partial` | No production deployment pipeline or host-specific configuration |
| Product depth | `Basic demo scope` | No profile management, password reset, audit trail, or rich filtering |
| Session storage | `Demo-friendly` | Auth state is stored in `localStorage` |

---

## 15. What Is Finished

The following deliverables are implemented in code:

- backend scaffold
- frontend scaffold
- PostgreSQL Prisma schema
- role-based authentication
- customer booking creation
- customer booking history
- owner pending booking review
- owner booking approval and rejection
- driver assignment during approval
- auto-assignment fallback for drivers
- owner invoice generation
- customer invoice listing
- owner invoice listing
- customer payment simulation
- driver assigned trip dashboard
- root-level startup orchestration
- environment auto-preparation
- basic documentation

---

## 16. Recommended Next Actions

### First actions to unblock the project

1. Install Docker Desktop.
2. Confirm `docker --version` works in a fresh terminal.
3. Start Docker Desktop and wait for the engine to be ready.
4. Run the app from `D:\Projetcs\STMS_FullStack` with:

```bash
npm install
npm run dev
```

5. Manually test the full happy path:

- create owner account
- create driver account
- create customer account
- customer creates booking
- owner approves booking
- owner generates invoice
- customer pays invoice
- driver sees assigned trip

6. Push the latest local commit:

```bash
git push origin main
```

### Recommended improvement backlog

1. Restrict `OWNER` and `DRIVER` signup.
2. Add a Prisma seed script.
3. Add automated tests.
4. Decide whether to keep `db push` or adopt migration-first startup.
5. Add deployment documentation and scripts.
6. Add a local PostgreSQL fallback mode if Docker should not be mandatory.

---

## 17. Suggested Continuation Order

If another developer continues this project, the cleanest order is:

1. Get Docker installed and confirmed working.
2. Verify full local runtime.
3. Push current local git state.
4. Add seed data.
5. Harden role creation rules.
6. Add test coverage.
7. Prepare deployment.

---

## 18. Files Worth Reading First

### Highest-priority continuation files

- `package.json`
- `docker-compose.yml`
- `scripts/check-prereqs.js`
- `scripts/prepare-env.js`
- `backend/server.js`
- `backend/prisma/schema.prisma`
- `backend/controllers/authController.js`
- `backend/controllers/bookingController.js`
- `backend/controllers/invoiceController.js`
- `backend/controllers/paymentController.js`
- `frontend/src/App.jsx`
- `frontend/src/context/AuthContext.jsx`
- `frontend/src/pages/CustomerDashboard.jsx`
- `frontend/src/pages/OwnerDashboard.jsx`
- `frontend/src/pages/DriverDashboard.jsx`
- `frontend/src/pages/PendingBookingsPage.jsx`
- `frontend/src/pages/InvoicePage.jsx`
- `frontend/src/pages/PaymentPage.jsx`

### Files that are not source of truth

- `node_modules/`
- `backend/node_modules/`
- `frontend/node_modules/`
- `frontend/dist/`
- `backend/.env`
- `frontend/.env`

These are generated or machine-local artifacts and should not be used as long-term project truth unless specifically needed for debugging.

---

## 19. New Machine Checklist

For a fresh machine or a transferred copy of this repo:

1. Install Node.js 18+.
2. Install Docker Desktop.
3. Start Docker Desktop and wait until the engine is running.
4. Open a terminal in the project root.
5. Run:

```bash
npm install
npm run dev
```

Expected outcome:

- PostgreSQL running on `localhost:5432`
- backend running on `http://localhost:5000`
- frontend running on `http://localhost:5173`

---

## 20. Final Status Assessment

| Dimension | Assessment |
|---|---|
| Implementation status | Strong demo-level completion |
| Code structure | Clean and easy to continue |
| Local developer experience | Good once Docker is available |
| Deployment readiness | Not finalized |
| Portability | Good with Docker installed |
| Handoff quality | Good |

The meaningful technical work is already in place: the application exists, the main workflows are implemented, and the repo has been reshaped into a single-root startup experience.

The remaining work is mostly operational and product-hardening work:

- install Docker and complete end-to-end verification
- push the latest local commit
- add tests and seed data
- tighten role creation and deployment readiness

In short: this is a usable demo application with a clear continuation path, and the main remaining blocker is environment setup rather than missing core application code.

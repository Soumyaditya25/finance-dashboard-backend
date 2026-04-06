# Finance Dashboard Backend

> **Live API:** `https://finance-dashboard-backend-h560.onrender.com`  
> **Swagger API Docs:** `https://finance-dashboard-backend-h560.onrender.com/api-docs`

A robust RESTful API backend for role-based management of financial records and advanced dashboard analytics.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Language | TypeScript (Node.js 20 LTS) |
| Framework | Express.js |
| Database | PostgreSQL 14+ |
| ORM | Prisma |
| Auth | JWT (jsonwebtoken + bcryptjs) |
| Validation | Zod |
| API Docs | Swagger UI (swagger-jsdoc + swagger-ui-express) |
| Testing | Jest + Supertest |

---

## Prerequisites

- **Node.js** 20 LTS or later
- **PostgreSQL** 14 or later
- `npm` or `yarn`

---

## Setup

### 1. Clone and install dependencies

```bash
git clone <repo-url>
cd finance-dashboard-backend
npm install
```

### 2. Configure environment

```bash
cp .env.example .env
```

Edit `.env` and fill in your PostgreSQL credentials:

```env
PORT=3000
NODE_ENV=development
DATABASE_URL=postgresql://your_user:your_password@127.0.0.1:5432/finance_dashboard
JWT_SECRET=<min 32 random chars — use: openssl rand -hex 32>
JWT_EXPIRES_IN=24h
BCRYPT_ROUNDS=10
CORS_ORIGIN=http://localhost:3001
```

> **Note:** If your password contains special characters (e.g. `@`), URL-encode them (e.g. `@` → `%40`). Use `127.0.0.1` instead of `localhost` to force TCP auth.

### 3. Create the PostgreSQL database

```bash
createdb finance_dashboard
# Or: sudo -u postgres psql -c "CREATE DATABASE finance_dashboard;"
```

Grant privileges if needed:

```bash
sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE finance_dashboard TO your_user;"
sudo -u postgres psql -c "ALTER ROLE your_user CREATEDB;"  # needed for Prisma shadow DB
```

### 4. Run database migrations

```bash
npx prisma migrate dev --name init
```

### 5. Seed the database

```bash
npm run seed
```

This creates:
- `admin@finance.dev` / `Admin1234!` — ADMIN role
- `analyst@finance.dev` / `Analyst1234!` — ANALYST role
- `viewer@finance.dev` / `Viewer1234!` — VIEWER role
- 30 realistic financial records across the last 6 months

### 6. Start the development server

```bash
npm run dev
```

Server runs at: `http://localhost:3000`
Swagger UI at: `http://localhost:3000/api-docs`

---

## Available Scripts

| Script | Description |
|---|---|
| `npm run dev` | Start dev server with hot-reload |
| `npm run build` | Compile TypeScript to `dist/` |
| `npm start` | Run compiled production server |
| `npm run seed` | Seed database with users and sample records |
| `npm test` | Run all tests |
| `npm run test:unit` | Run unit tests only |
| `npm run test:integration` | Run integration tests only |
| `npx prisma studio` | Open Prisma GUI |

---

## Role Permissions

| Action | VIEWER | ANALYST | ADMIN |
|---|---|---|---|
| Login / Logout | ✅ | ✅ | ✅ |
| `GET /auth/me` | ✅ | ✅ | ✅ |
| `GET /records`, `GET /records/:id` | ✅ | ✅ | ✅ |
| All `GET /dashboard/*` | ❌ | ✅ | ✅ |
| `POST/PATCH/DELETE /records` | ❌ | ❌ | ✅ |
| `POST /records/:id/restore` | ❌ | ❌ | ✅ |
| `GET /records/deleted` | ❌ | ❌ | ✅ |
| All `/users` endpoints | ❌ | ❌ | ✅ |
| `POST /auth/register` | ❌ | ❌ | ✅ |

Inactive users (status `INACTIVE`) receive `401` on every authenticated request.

---

## API Endpoint Reference

### Auth  `/api/auth`
| Method | Path | Access | Description |
|---|---|---|---|
| `POST` | `/auth/register` | Admin | Create new user account |
| `POST` | `/auth/login` | Public | Login, receive JWT |
| `GET` | `/auth/me` | Authenticated | Current user profile |
| `POST` | `/auth/logout` | Authenticated | Client-side token discard |

### Users `/api/users`
| Method | Path | Access | Description |
|---|---|---|---|
| `GET` | `/users` | Admin | List users (paginated) |
| `GET` | `/users/:id` | Admin | Get user by ID |
| `POST` | `/users` | Admin | Create user |
| `PATCH` | `/users/:id` | Admin | Update name, role, status |
| `DELETE` | `/users/:id` | Admin | Delete user |

### Financial Records `/api/records`
| Method | Path | Access | Description |
|---|---|---|---|
| `GET` | `/records` | All | List with filters + pagination |
| `GET` | `/records/deleted` | Admin | List soft-deleted records |
| `GET` | `/records/:id` | All | Get one record |
| `POST` | `/records` | Admin | Create record |
| `PATCH` | `/records/:id` | Admin | Update record |
| `DELETE` | `/records/:id` | Admin | Soft delete |
| `POST` | `/records/:id/restore` | Admin | Restore deleted record |

**Filter params for `GET /records`:**
`type`, `category`, `from`, `to`, `page`, `limit` (max 100), `sort` (e.g. `date:desc`), `search` (matches notes field)

### Dashboard `/api/dashboard`
| Method | Path | Access | Description |
|---|---|---|---|
| `GET` | `/dashboard/summary` | Analyst, Admin | Total income, expenses, net balance |
| `GET` | `/dashboard/by-category` | Analyst, Admin | Grouped totals + percentages |
| `GET` | `/dashboard/trends/monthly` | Analyst, Admin | Monthly time series |
| `GET` | `/dashboard/trends/weekly` | Analyst, Admin | Weekly time series |
| `GET` | `/dashboard/recent` | Analyst, Admin | Last N records (max 50) |

---

## Sample Requests

### POST /api/auth/login

```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@finance.dev","password":"Admin1234!"}'
```

```json
{
  "success": true,
  "data": {
    "user": { "id": "...", "email": "admin@finance.dev", "role": "ADMIN" },
    "token": "eyJhbGci..."
  },
  "message": "Login successful"
}
```

### GET /api/dashboard/summary

```bash
curl http://localhost:3000/api/dashboard/summary?from=2025-01-01&to=2025-03-31 \
  -H "Authorization: Bearer <token>"
```

```json
{
  "success": true,
  "data": {
    "totalIncome": 450000000,
    "totalExpenses": 105000000,
    "netBalance": 345000000,
    "recordCount": 24,
    "period": { "from": "2025-01-01", "to": "2025-03-31" }
  }
}
```

---

## Assumptions & Design Decisions

| Decision | Choice | Reason |
|---|---|---|
| Registration access | Admin-only | Prevents public account creation; matches production RBAC expectations |
| Viewer record scope | All records (not own-only) | Simpler, documented in README per PRD guidance |
| Amount storage | `BigInt` (paise/cents) | Avoids floating-point errors in financial calculations |
| Date storage | UTC ISO-8601 | Consistent timezone handling across all clients |
| Soft delete | `deletedAt` timestamp | Captures deletion time; easier to restore; queryable |
| Auth | JWT stateless (24h expiry) | No session store needed; simple for REST APIs |
| RBAC | Middleware-based | Sufficient for 3 static roles; DB policy tables would be overkill |
| `localhost` vs `127.0.0.1` | Use `127.0.0.1` | Forces TCP auth, avoiding Unix socket peer auth conflicts |
| Aggregations | DB-level (Prisma `aggregate` + `$queryRaw`) | No in-memory aggregation; efficient at scale |

---

## Additional Features

Beyond the core functionality, this project includes a few architecture optimizations:

- **Database Connection Management:** A Prisma singleton proxy is implemented in `src/config/prisma.ts` to prevent database connection exhaustion during development hot-reloads and serverless deployments.
- **Audit Logging:** An `AuditLog` table tracks all write operations on financial records. `CREATE`, `UPDATE`, `DELETE`, and `RESTORE` events are logged with timestamps, the actor's `userId`, and immutable snapshots of the data state (`oldData`/`newData`).


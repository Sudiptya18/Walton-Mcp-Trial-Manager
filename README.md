# WALTON MCP Trial Manager

Enterprise multi-user web application wrapping the **existing** WALTON MCP Trial Sheet (HTML/PDF/forms) with Vue 3, Node.js, Express, JWT auth, and MySQL.

## Critical design rule

The legacy Trial Sheet is served **unchanged** from `client/public/legacy/trial-sheet.html` (iframe). No changes to form layout, PDF, calculations, or list behavior.

New layers only:

- Login / logout / roles
- Admin user management
- Dashboard & activity/login logs
- MySQL tables: `users`, `login_logs`, `activity_logs`

---

## Project structure

```
walton-mcp-trial-manager/
├── client/                 # Vue 3 + Vite + Pinia + Bootstrap 5
│   ├── public/legacy/      # Paste existing index-2.html → trial-sheet.html
│   └── src/
├── server/                 # Express + JWT + bcrypt
│   └── src/
├── server/migrations/      # Database migrations (npm run migrate)
├── mysql-schema/           # Legacy SQL snapshot + docs
└── README.md
```

---

## Project location (this install)

```
C:\xampp\htdocs\walton-mcp-trial-manager
```

Legacy Trial Sheet source (installed):

```
Desktop\WALTON MCP TRAIL MANAGER.html  →  client\public\legacy\trial-sheet.html
```

Use **XAMPP MySQL** for the database (`DB_HOST=127.0.0.1`, `DB_USER=root`, `DB_PASSWORD=` empty by default).

---

## Prerequisites

1. **Node.js LTS** (20+)
2. **MySQL** (XAMPP MySQL or standalone)
3. **Git** (optional)

---

## Form data storage

| Storage | Location |
|---------|----------|
| **MySQL (server)** | Table **`trial_records`** — column **`form_data`** (JSON) |
| Browser (legacy) | `localStorage` → `MCP_RecentTrials` |
| File (legacy) | `.trial` download / save folder |

API: `POST /api/trials`, `GET /api/trials`, `GET /api/trials/:id`

---

## One-time install + waltonmcp.localhost

```powershell
cd C:\xampp\htdocs\walton-mcp-trial-manager

# 1. Hosts (Administrator Notepad): add line from local\hosts.snippet.txt
#    127.0.0.1  waltonmcp.localhost

# 2. Local config (gitignored)
copy local\dev.example.json local\dev.json
npm run setup:local

# 3. Install ALL dependencies once (client + server)
npm run install:all

# 4. Database + admin
npm run migrate
npm run seed-admin

# 5. Build website + start API (your workflow)
npm run build
npm run start:api
```

Open: **http://waltonmcp.localhost** (port 80 — same as hris / dms / shipment)

Does **not** share their vhosts; API uses port **5080** only. See `local/PORTS.md`.

Details: `local/README.md`

---

## Local development

### 1. Database

```powershell
npm run setup:local
npm run migrate
npm run seed-admin
```

Or legacy phpMyAdmin import: `mysql-schema/schema.sql`

```powershell
npm run migrate:status   # see pending / applied migrations
```

Default admin: `admin` / `Admin@123` — change in production.

### 2. Backend

```bash
cd server
npm install
npm run dev
```

API: http://localhost:5000  
Health: http://localhost:5000/api/health

### 3. Legacy HTML

Already copied to `client/public/legacy/trial-sheet.html`. To refresh from Desktop, run:

```powershell
Copy-Item -LiteralPath "...\Desktop\WALTON MCP TRAIL MANAGER.html" `
  -Destination "C:\xampp\htdocs\walton-mcp-trial-manager\client\public\legacy\trial-sheet.html" -Force
```

### 4. Frontend

```bash
cd client
copy .env.example .env
npm install
npm run dev
```

App: http://localhost:5173

`VITE_API_URL` can stay empty in dev (Vite proxies `/api` to port 5000).

---

## Environment variables

### Frontend (`client/.env`)

| Variable | Example |
|----------|---------|
| `VITE_API_URL` | `https://your-api.railway.app` |

### Backend (`server/.env`)

| Variable | Description |
|----------|-------------|
| `PORT` | `5000` |
| `DB_HOST` | MySQL host |
| `DB_PORT` | `3306` |
| `DB_NAME` | `walton_mcp_trial` |
| `DB_USER` | MySQL user |
| `DB_PASSWORD` | MySQL password |
| `JWT_SECRET` | Long random string |
| `JWT_EXPIRES_IN` | `7d` |
| `CLIENT_URL` | Frontend URL for CORS |
| `COOKIE_SECURE` | `true` in production HTTPS |

---

## API reference

### Authentication

| Method | Path | Auth |
|--------|------|------|
| POST | `/api/auth/login` | Public |
| POST | `/api/auth/logout` | JWT |
| GET | `/api/auth/profile` | JWT |
| POST | `/api/auth/forgot-password` | Public |

### User management (admin)

| Method | Path |
|--------|------|
| GET | `/api/users` |
| POST | `/api/users` |
| PUT | `/api/users/:id` |
| DELETE | `/api/users/:id` (disables) |
| POST | `/api/users/:id/reset-password` |

### Dashboard

| Method | Path |
|--------|------|
| GET | `/api/dashboard/stats` |
| GET | `/api/dashboard/activity-logs` | Admin |

### Audit (optional)

| Method | Path |
|--------|------|
| POST | `/api/activity` | Log client events |

---

## Roles

| Role | Access |
|------|--------|
| **admin** | Dashboard, users, activity logs, trial sheet |
| **user** | Trial sheet, own session; no user admin |

---

## Security

- JWT + httpOnly cookie support
- bcrypt (12 rounds)
- Helmet, CORS, rate limit on `/api`
- Parameterized SQL (mysql2)
- Input sanitization (validator)
- CSRF token endpoint: `GET /api/csrf-token`

---

## GitHub

```bash
git init
git add .
git commit -m "Initial commit: WALTON MCP Trial Manager full stack"
git remote add origin <repository-url>
git branch -M main
git push -u origin main
```

---

## Deploy frontend (Vercel)

1. Push repo to GitHub  
2. Vercel → Import repository  
3. **Root Directory:** `client`  
4. Build: `npm run build`  
5. Output: `dist`  
6. Env: `VITE_API_URL=https://your-backend-url`  
7. Deploy  

`client/vercel.json` includes SPA rewrites.

---

## Deploy backend (Railway / Render)

1. New service from repo  
2. **Root:** `server`  
3. Start: `npm start`  
4. Add env: `PORT`, `DB_*`, `JWT_SECRET`, `CLIENT_URL` (Vercel URL)  
5. Copy public API URL → update `VITE_API_URL` → redeploy frontend  

`server/railway.json` included for Railway.

---

## MySQL hosting

- Railway MySQL  
- PlanetScale  
- Aiven  
- DigitalOcean Managed MySQL  

Run `npm run migrate`, then `npm run seed-admin`, with `DB_*` in `server/.env`.

---

## Next steps (optional)

- Sync trial saves from legacy app to MySQL (without changing HTML UI) via postMessage bridge  
- Email-based password reset  
- HTTPS-only cookies in production  

---

## Support

Place existing Trial HTML at `client/public/legacy/trial-sheet.html` before UAT. All form/PDF behavior remains exactly as in the standalone HTML file.

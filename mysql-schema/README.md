# mysql-schema (legacy SQL)

**Source of truth:** `server/migrations/` — run with:

```powershell
npm run setup:local   # writes server/.env from local/dev.json
npm run migrate
npm run seed-admin
```

## Commands

| Command | Description |
|---------|-------------|
| `npm run migrate` | Run all pending migrations |
| `npm run migrate:status` | Show which migrations have run |
| `npm run migrate:rollback` | Roll back the last migration |

## Migrations

| File | Table / action |
|------|----------------|
| `20250605000001_create_database.js` | Creates `walton_mcp_trial` database |
| `20250605000002_create_users_table.js` | `users` |
| `20250605000003_create_login_logs_table.js` | `login_logs` |
| `20250605000004_create_activity_logs_table.js` | `activity_logs` |
| `20250605000005_create_trial_records_table.js` | `trial_records` |
| `20250606000006_add_employee_id_to_users.js` | `users.employee_id` |

## Legacy files

- `schema.sql` — consolidated snapshot (same as running all migrations). Use only if you prefer phpMyAdmin import.
- `02-trial_records.sql` — deprecated; included in migration `000005`.
- `seed.sql` — placeholder; use `npm run seed-admin` instead.

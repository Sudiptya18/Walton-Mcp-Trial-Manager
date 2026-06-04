# Database tables

## Auth & admin (added by this project)

| Table | Purpose |
|-------|---------|
| `users` | Login accounts (admin / user) |
| `login_logs` | Login success/failure audit |
| `activity_logs` | Admin actions, trial open, etc. |

## Trial form data

| Table | Purpose |
|-------|---------|
| **`trial_records`** | **All saved Trial Sheet form data** |

Each save stores:

- Metadata: `filename`, `product_name`, `trial_name`, `trial_date`, `trial_type`, …
- **`form_data`** (JSON): full form payload from legacy `collectFormData()` (APCC values, heat rows, checkboxes, notes, etc.)

### Still in the browser (unchanged legacy behavior)

- **Recent Files** list: `localStorage` key `MCP_RecentTrials`
- **Optional .trial file** download / folder save (File System API)

MySQL is the **server backup / multi-user** copy when you save from the app logged in.

---

## Apply schema (recommended)

```powershell
npm run setup:local
npm run migrate
npm run seed-admin
```

Check status: `npm run migrate:status`

---

## Legacy: manual SQL import

```bash
mysql -u root -p < mysql-schema/schema.sql
```

If you already imported an older schema without `trial_records`, run migrations instead:

```powershell
npm run migrate
```

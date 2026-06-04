# waltonmcp.localhost — separate from HRIS / DMS / Shipment

Uses the **same pattern** as your other apps: **hostname on port 80** + **own Apache vhost**.  
Does **not** reuse `hris.localhost`, `admin.dms.localhost`, or `shipment.localhost` folders or ports.

See **`PORTS.md`** for port isolation (API **5080** only).

---

## One-time setup

### 1. Hosts (Administrator)

`C:\Windows\System32\drivers\etc\hosts` — add **one line** (keep your existing lines):

```
127.0.0.1  waltonmcp.localhost
```

### 2. Apache virtual host (XAMPP)

1. Open `C:\xampp\apache\conf\extra\httpd-vhosts.conf`
2. At the **bottom**, add:

   ```apache
   Include "C:/xampp/htdocs/walton-mcp-trial-manager/local/apache/waltonmcp.localhost.conf"
   ```

3. In `C:\xampp\apache\conf\httpd.conf`, ensure these are **uncommented**:

   ```apache
   LoadModule proxy_module modules/mod_proxy.so
   LoadModule proxy_http_module modules/mod_proxy_http.so
   Include conf/extra/httpd-vhosts.conf
   ```

4. Restart Apache in XAMPP.

Your HRIS/DMS/Shipment vhosts stay unchanged; only **waltonmcp.localhost** points to `client/dist`.

### 3. Project env

```powershell
cd C:\xampp\htdocs\walton-mcp-trial-manager
copy local\dev.example.json local\dev.json
npm run setup:local
npm run install:all
```

MySQL: `npm run migrate` → `npm run seed-admin`

---

## Daily use (production build — how you asked)

```powershell
npm run build
npm run start:api
```

Open: **http://waltonmcp.localhost** (no port number — like your other sites)

| Step | Command |
|------|---------|
| After Vue changes | `npm run build` |
| API (keep running) | `npm run start:api` |

Shortcut (build + start API):

```powershell
npm run local
```

---

## Optional: Vite preview (without Apache)

Only if you skip Apache for this app:

```powershell
npm run build
npm run preview
```

→ http://waltonmcp.localhost:**4180** (does not use 80 or other apps’ ports)

---

`local/dev.json` is **gitignored**.

# WALTON MCP — local ports (no overlap with your other apps)

Your other sites use **separate hostnames on port 80** (Apache/XAMPP):

| Site | Hostname | Typical setup |
|------|----------|----------------|
| HRIS | `hris.localhost` | Apache vhost → own folder |
| DMS Admin | `admin.dms.localhost` | Apache vhost → own folder |
| Shipment | `shipment.localhost` | Apache vhost → own folder |
| **WALTON MCP** | **`waltonmcp.localhost`** | Apache vhost → `client/dist` only |

This project does **not** use port 8080, 5173, or 5000 for the website.

| Service | Port | Notes |
|---------|------|--------|
| Website (built) | **80** | `http://waltonmcp.localhost` — same pattern as HRIS/DMS |
| WALTON API only | **5080** | Node Express — only this app; proxied as `/api` on waltonmcp vhost |
| Vite preview (optional) | **4180** | Only if you run `npm run preview` instead of Apache |

If port **5080** is already in use on your PC, change `apiPort` in `local/dev.json` and update the Apache `ProxyPass` port in `local/apache/waltonmcp.localhost.conf`.

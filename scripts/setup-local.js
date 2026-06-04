/**
 * Applies local/dev.json → server/.env and client/.env
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const localPath = path.join(root, 'local', 'dev.json');
const examplePath = path.join(root, 'local', 'dev.example.json');

if (!fs.existsSync(localPath)) {
  if (fs.existsSync(examplePath)) {
    fs.mkdirSync(path.join(root, 'local'), { recursive: true });
    fs.copyFileSync(examplePath, localPath);
    console.log('Created local/dev.json from dev.example.json');
  } else {
    console.error('Missing local/dev.json');
    process.exit(1);
  }
}

const cfg = JSON.parse(fs.readFileSync(localPath, 'utf8'));
const host = cfg.host || 'waltonmcp.localhost';
const devBindHost = cfg.devBindHost ?? '127.0.0.1';
const vitePort = cfg.vitePreviewPort ?? 4180;
const apiPort = cfg.apiPort ?? 5080;
const appUrl = `http://${host}`;
const apiUrl = cfg.apiUrl ?? '';
const corsOrigins = [
  'http://localhost',
  'http://127.0.0.1',
  `http://localhost:${vitePort}`,
  `http://127.0.0.1:${vitePort}`,
  `http://${host}`,
].join(',');

const serverEnv = `PORT=${apiPort}
NODE_ENV=development

DB_HOST=${cfg.dbHost || '127.0.0.1'}
DB_PORT=${cfg.dbPort || 3306}
DB_NAME=${cfg.dbName || 'walton_mcp_trial'}
DB_USER=${cfg.dbUser || 'root'}
DB_PASSWORD=${cfg.dbPassword ?? ''}

JWT_SECRET=${cfg.jwtSecret || 'walton-mcp-local-dev-secret'}
JWT_EXPIRES_IN=7d

CLIENT_URL=${appUrl}
CLIENT_URLS=${corsOrigins}
COOKIE_SECURE=false
`;

const clientEnv = `# Empty = same-origin /api via Apache ProxyPass on waltonmcp.localhost only
VITE_API_URL=${apiUrl}
VITE_DEV_HOST=${host}
VITE_DEV_BIND=${devBindHost}
VITE_DEV_PORT=${vitePort}
`;

fs.writeFileSync(path.join(root, 'server', '.env'), serverEnv);
fs.writeFileSync(path.join(root, 'client', '.env'), clientEnv);

console.log('');
console.log('WALTON MCP local config applied (isolated from hris / dms / shipment).');
console.log('  Website:  ' + appUrl + '  (Apache port 80, after npm run build)');
console.log('  API:      http://127.0.0.1:' + apiPort + '  (proxied as ' + appUrl + '/api)');
console.log('');
console.log('Hosts file (Administrator):');
console.log('  127.0.0.1  ' + host);
console.log('');
console.log('Apache: Include local/apache/waltonmcp.localhost.conf in httpd-vhosts.conf');
console.log('');
console.log('Then: npm run build && npm run start:api');
console.log('Open: ' + appUrl);
console.log('Dev (no hosts file): npm run dev → http://127.0.0.1:' + vitePort);

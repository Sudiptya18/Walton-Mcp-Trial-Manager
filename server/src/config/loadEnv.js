import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const serverRoot = path.join(path.dirname(fileURLToPath(import.meta.url)), '../..');

export function loadServerEnv() {
  dotenv.config({ path: path.join(serverRoot, '.env') });
  applyMysqlPublicUrl();
}

/** Parse Railway MYSQL_PUBLIC_URL into DB_* (skip unresolved ${{...}} templates). */
export function applyMysqlPublicUrl() {
  const url = process.env.MYSQL_PUBLIC_URL?.trim();
  if (!url || url.includes('${{')) return;

  try {
    const parsed = new URL(url.replace(/^mysql:\/\//, 'https://'));
    process.env.DB_HOST = parsed.hostname;
    process.env.DB_PORT = parsed.port || '3306';
    process.env.DB_USER = decodeURIComponent(parsed.username || 'root');
    process.env.DB_PASSWORD = decodeURIComponent(parsed.password || '');
    process.env.DB_NAME = (parsed.pathname || '/railway').replace(/^\//, '') || 'railway';
  } catch {
    console.warn('[env] Could not parse MYSQL_PUBLIC_URL — set DB_HOST and DB_PORT manually.');
  }
}

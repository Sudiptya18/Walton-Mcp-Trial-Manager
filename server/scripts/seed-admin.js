/**
 * Run after migrations: npm run migrate && npm run seed-admin
 * Creates default admin (admin / Admin@123) if missing.
 */
import bcrypt from 'bcrypt';
import mysql from 'mysql2/promise';
import { loadServerEnv } from '../src/config/loadEnv.js';

loadServerEnv();

const pool = mysql.createPool({
  host: process.env.DB_HOST || '127.0.0.1',
  port: Number(process.env.DB_PORT || 3306),
  database: process.env.DB_NAME || 'walton_mcp_trial',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
});

const password = process.env.ADMIN_PASSWORD || 'Admin@123';
const hash = await bcrypt.hash(password, 12);

await pool.execute(
  `INSERT INTO users (name, username, employee_id, email, password, role, status)
   VALUES ('System Administrator', 'admin', 'EMP-ADMIN', 'admin@walton.local', ?, 'admin', 'active')
   ON DUPLICATE KEY UPDATE password = VALUES(password), employee_id = VALUES(employee_id)`,
  [hash]
);

console.log('Admin user ready: username=admin password=' + password);
await pool.end();

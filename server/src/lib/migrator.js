import fs from 'fs';
import path from 'path';
import { fileURLToPath, pathToFileURL } from 'url';
import mysql from 'mysql2/promise';

const migrationsDir = path.join(
  path.dirname(fileURLToPath(import.meta.url)),
  '../../migrations'
);

function getConfig() {
  return {
    host: process.env.DB_HOST || '127.0.0.1',
    port: Number(process.env.DB_PORT || 3306),
    database: process.env.DB_NAME || 'walton_mcp_trial',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
  };
}

async function createConnection(database) {
  const cfg = getConfig();
  return mysql.createConnection({
    host: cfg.host,
    port: cfg.port,
    user: cfg.user,
    password: cfg.password,
    ...(database !== undefined ? { database } : {}),
  });
}

async function ensureMigrationsTable(conn) {
  await conn.query(`
    CREATE TABLE IF NOT EXISTS schema_migrations (
      id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(255) NOT NULL UNIQUE,
      batch INT UNSIGNED NOT NULL,
      executed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    ) ENGINE=InnoDB
  `);
}

async function loadMigrationFiles() {
  const files = fs
    .readdirSync(migrationsDir)
    .filter((f) => f.endsWith('.js'))
    .sort();

  const migrations = [];
  for (const file of files) {
    const mod = await import(pathToFileURL(path.join(migrationsDir, file)).href);
    if (!mod.name || typeof mod.up !== 'function') {
      throw new Error(`Invalid migration ${file}: export name and up() required`);
    }
    migrations.push({ file, name: mod.name, up: mod.up, down: mod.down });
  }
  return migrations;
}

async function getExecutedNames(conn) {
  const [rows] = await conn.query('SELECT name FROM schema_migrations ORDER BY id');
  return new Set(rows.map((r) => r.name));
}

async function getLastBatch(conn) {
  const [rows] = await conn.query('SELECT MAX(batch) AS batch FROM schema_migrations');
  return rows[0]?.batch ?? 0;
}

export async function migrationStatus() {
  const cfg = getConfig();
  let conn;

  try {
    conn = await createConnection(cfg.database);
  } catch {
    return (await loadMigrationFiles()).map((m) => ({
      name: m.name,
      file: m.file,
      ran: false,
    }));
  }

  try {
    await ensureMigrationsTable(conn);
    const executed = await getExecutedNames(conn);
    const all = await loadMigrationFiles();
    return all.map((m) => ({
      name: m.name,
      file: m.file,
      ran: executed.has(m.name),
    }));
  } finally {
    await conn.end();
  }
}

export async function migrate() {
  const cfg = getConfig();
  const all = await loadMigrationFiles();
  let conn = await createConnection();
  let ran = 0;
  let migrationsTableReady = false;

  try {
    let executed = new Set();
    let batch = 1;

    try {
      const dbConn = await createConnection(cfg.database);
      await ensureMigrationsTable(dbConn);
      migrationsTableReady = true;
      executed = await getExecutedNames(dbConn);
      batch = (await getLastBatch(dbConn)) + 1;
      await dbConn.end();
      conn = await createConnection(cfg.database);
    } catch {
      // Database may not exist yet — first migration creates it
    }

    for (const m of all) {
      if (executed.has(m.name)) continue;

      console.log(`  Migrating: ${m.file}`);

      if (m.name === 'create_database') {
        await m.up(conn, cfg);
        await conn.end();
        conn = await createConnection(cfg.database);
        if (!migrationsTableReady) {
          await ensureMigrationsTable(conn);
          migrationsTableReady = true;
        }
        await conn.query('INSERT INTO schema_migrations (name, batch) VALUES (?, ?)', [
          m.name,
          batch,
        ]);
        executed.add(m.name);
        ran++;
        continue;
      }

      if (!migrationsTableReady) {
        await ensureMigrationsTable(conn);
        migrationsTableReady = true;
      }

      await m.up(conn, cfg);
      await conn.query('INSERT INTO schema_migrations (name, batch) VALUES (?, ?)', [
        m.name,
        batch,
      ]);
      executed.add(m.name);
      ran++;
    }

    if (ran === 0) {
      console.log('Nothing to migrate.');
    } else {
      console.log(`Ran ${ran} migration(s).`);
    }
  } finally {
    await conn.end();
  }
}

export async function rollback(steps = 1) {
  const cfg = getConfig();
  const conn = await createConnection(cfg.database);

  try {
    await ensureMigrationsTable(conn);
    const [rows] = await conn.query(
      'SELECT name FROM schema_migrations ORDER BY id DESC LIMIT ?',
      [steps]
    );

    if (!rows.length) {
      console.log('Nothing to rollback.');
      return;
    }

    const all = await loadMigrationFiles();
    const byName = Object.fromEntries(all.map((m) => [m.name, m]));

    for (const row of rows) {
      const m = byName[row.name];
      if (!m?.down) {
        throw new Error(`Migration "${row.name}" has no down() — cannot rollback`);
      }
      console.log(`  Rolling back: ${m.file}`);

      await m.down(conn, cfg);
      await conn.query('DELETE FROM schema_migrations WHERE name = ?', [row.name]);
    }

    console.log(`Rolled back ${rows.length} migration(s).`);
  } finally {
    await conn.end();
  }
}

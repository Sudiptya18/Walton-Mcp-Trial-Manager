/**
 * Database migrations (replaces manual mysql-schema/*.sql import).
 *
 *   npm run migrate              # run pending migrations
 *   npm run migrate:status       # list migrations
 *   npm run migrate:rollback     # rollback last migration
 */
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { migrate, migrationStatus, rollback } from '../src/lib/migrator.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, '..', '.env') });

const cmd = process.argv[2] || 'migrate';
const steps = Number(process.argv.find((a) => a.startsWith('--step='))?.split('=')[1] || 1);

async function main() {
  if (cmd === 'status') {
    const rows = await migrationStatus();
    for (const r of rows) {
      console.log(`${r.ran ? '[x]' : '[ ]'} ${r.file} (${r.name})`);
    }
    return;
  }

  if (cmd === 'rollback') {
    await rollback(steps);
    return;
  }

  if (cmd === 'migrate') {
    await migrate();
    return;
  }

  console.error(`Unknown command: ${cmd}`);
  console.error('Usage: node scripts/migrate.js [migrate|status|rollback] [--step=N]');
  process.exit(1);
}

main().catch((err) => {
  console.error(err.message || err);
  process.exit(1);
});

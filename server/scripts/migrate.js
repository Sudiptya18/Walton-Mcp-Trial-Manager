/**
 * Database migrations (replaces manual mysql-schema/*.sql import).
 *
 *   npm run migrate              # run pending migrations
 *   npm run migrate:status       # list migrations
 *   npm run migrate:rollback     # rollback last migration
 */
import { loadServerEnv } from '../src/config/loadEnv.js';
import { migrate, migrationStatus, rollback } from '../src/lib/migrator.js';

loadServerEnv();

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

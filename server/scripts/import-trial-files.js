/**
 * Import legacy .trial JSON files into trial_records.
 *
 *   node scripts/import-trial-files.js [folder]
 *   TRIAL_IMPORT_DIR="..." node scripts/import-trial-files.js
 */
import fs from 'fs';
import path from 'path';
import mysql from 'mysql2/promise';
import { loadServerEnv } from '../src/config/loadEnv.js';
import { fileURLToPath } from 'url';

loadServerEnv();
const __dirname = path.dirname(fileURLToPath(import.meta.url));

const defaultDir =
  'C:\\Users\\Sudiptya Chanda\\OneDrive - Artisan Business Network Bangladesh\\Desktop\\Trial Files WALTON MCP';
const importDir = path.resolve(process.argv[2] || process.env.TRIAL_IMPORT_DIR || defaultDir);
const ownerUsername = process.env.IMPORT_USER || 'admin';

function parseFilename(name) {
  const base = path.basename(name, '.trial');
  const m = base.match(/^TrialSheet_(.+)_(\d{2}-\d{2}-\d{4})_(.+)$/);
  if (!m) return { productName: null, trialDate: null, trialType: null };
  let trialType = m[3];
  const hhmm = trialType.match(/^(.+)_(\d{4})$/);
  if (hhmm) trialType = hhmm[1];
  return { productName: m[1].replace(/_/g, ' '), trialDate: m[2], trialType };
}

function requiredByFromForm(form) {
  if (form.reqByMode === 'text' || form.reqBySelect === 'Text') {
    return form.reqByInput?.trim() || null;
  }
  return form.reqBySelect?.trim() || form.reqByInput?.trim() || null;
}

function trialDateFromForm(form, fromFile) {
  if (form.dateInput) {
    const iso = form.dateInput.match(/^(\d{4})-(\d{2})-(\d{2})$/);
    if (iso) return `${iso[3]}-${iso[2]}-${iso[1]}`;
    return form.dateInput;
  }
  return fromFile.trialDate;
}

function savedAtFromForm(form, filePath) {
  if (form._savedAt) return new Date(form._savedAt);
  const stat = fs.statSync(filePath);
  return stat.mtime;
}

const pool = mysql.createPool({
  host: process.env.DB_HOST || '127.0.0.1',
  port: Number(process.env.DB_PORT || 3306),
  database: process.env.DB_NAME || 'walton_mcp_trial',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
});

if (!fs.existsSync(importDir)) {
  console.error('Folder not found:', importDir);
  process.exit(1);
}

const files = fs.readdirSync(importDir).filter((f) => f.toLowerCase().endsWith('.trial'));
if (!files.length) {
  console.error('No .trial files in:', importDir);
  process.exit(1);
}

const [users] = await pool.execute(
  'SELECT id FROM users WHERE username = ? LIMIT 1',
  [ownerUsername]
);
if (!users[0]) {
  console.error(`User "${ownerUsername}" not found. Run npm run seed-admin first.`);
  process.exit(1);
}
const userId = users[0].id;

let inserted = 0;
let skipped = 0;

for (const file of files) {
  const filePath = path.join(importDir, file);
  const raw = fs.readFileSync(filePath, 'utf8');
  let form;
  try {
    form = JSON.parse(raw);
  } catch {
    console.error('  Skip (invalid JSON):', file);
    skipped++;
    continue;
  }

  const fromName = parseFilename(file);
  const filename = file;
  const productName = form.productNameInput?.trim() || fromName.productName;
  const trialName = form.trialNameInput?.trim() || null;
  const trialDate = trialDateFromForm(form, fromName);
  const trialType = form.trialTypeSelect?.trim() || fromName.trialType || null;
  const materialType = form.materialTypeSelect?.trim() || null;
  const docNum = form.docNumInput?.trim() || null;
  const requiredBy = requiredByFromForm(form);
  const purpose = form.trialDescInput?.trim() || null;
  const savedAt = savedAtFromForm(form, filePath);

  const [existing] = await pool.execute(
    'SELECT id FROM trial_records WHERE user_id = ? AND filename = ? LIMIT 1',
    [userId, filename]
  );
  if (existing[0]) {
    console.log('  Exists:', filename);
    skipped++;
    continue;
  }

  await pool.execute(
    `INSERT INTO trial_records
     (user_id, filename, product_name, trial_name, trial_date, trial_type, material_type,
      doc_num, required_by, purpose, form_data, saved_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      userId,
      filename,
      productName || null,
      trialName || null,
      trialDate || null,
      trialType || null,
      materialType || null,
      docNum || null,
      requiredBy || null,
      purpose || null,
      JSON.stringify(form),
      savedAt,
    ]
  );
  console.log('  Imported:', filename);
  inserted++;
}

console.log('');
console.log(`Done: ${inserted} inserted, ${skipped} skipped (${files.length} files in folder).`);
console.log(`Owner: ${ownerUsername} (user_id=${userId})`);
await pool.end();

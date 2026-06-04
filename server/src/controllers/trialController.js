import pool from '../config/db.js';
import { logActivity } from '../services/activityService.js';

export async function listTrials(req, res) {
  const [rows] = await pool.execute(
    `SELECT t.id, t.filename, t.product_name, t.trial_name, t.trial_date,
            t.trial_type, t.material_type, t.doc_num, t.required_by, t.purpose,
            t.form_data, t.saved_at, t.created_at, u.name AS created_by_name, u.username AS created_by
     FROM trial_records t
     JOIN users u ON u.id = t.user_id
     ORDER BY t.saved_at DESC, t.id DESC
     LIMIT 500`
  );
  const trials = rows.map((row) => ({
    ...row,
    form_data:
      typeof row.form_data === 'string' ? JSON.parse(row.form_data) : row.form_data,
  }));
  res.json({ trials });
}

export async function getTrial(req, res) {
  const id = Number(req.params.id);
  const [rows] = await pool.execute(
    `SELECT t.*, u.name AS created_by_name, u.username AS created_by
     FROM trial_records t
     JOIN users u ON u.id = t.user_id
     WHERE t.id = :id
     LIMIT 1`,
    { id }
  );
  if (!rows[0]) return res.status(404).json({ message: 'Trial not found' });
  const row = rows[0];
  row.form_data = typeof row.form_data === 'string' ? JSON.parse(row.form_data) : row.form_data;
  res.json({ trial: row });
}

export async function createTrial(req, res) {
  const {
    filename,
    productName,
    trialName,
    date,
    requiredBy,
    trialType,
    materialType,
    docNum,
    purpose,
    formData,
    savedAt,
  } = req.body;

  if (!filename || !formData) {
    return res.status(400).json({ message: 'filename and formData required' });
  }

  const [result] = await pool.execute(
    `INSERT INTO trial_records
     (user_id, filename, product_name, trial_name, trial_date, trial_type, material_type,
      doc_num, required_by, purpose, form_data, saved_at)
     VALUES
     (:userId, :filename, :productName, :trialName, :trialDate, :trialType, :materialType,
      :docNum, :requiredBy, :purpose, :formData, :savedAt)`,
    {
      userId: req.user.id,
      filename,
      productName: productName || null,
      trialName: trialName || null,
      trialDate: date || null,
      trialType: trialType || null,
      materialType: materialType || null,
      docNum: docNum || null,
      requiredBy: requiredBy || null,
      purpose: purpose || null,
      formData: JSON.stringify(formData),
      savedAt: savedAt ? new Date(savedAt) : new Date(),
    }
  );

  await logActivity({
    userId: req.user.id,
    action: 'trial_saved',
    entityType: 'trial_record',
    entityId: String(result.insertId),
    ip: req.ip,
    details: { filename, productName },
  });

  res.status(201).json({ id: result.insertId, message: 'Trial saved to database' });
}

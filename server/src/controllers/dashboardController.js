import pool from '../config/db.js';

export async function getStats(req, res) {
  const [[users]] = await pool.query(
    `SELECT COUNT(*) AS total FROM users WHERE status = 'active'`
  );
  const [[loginsToday]] = await pool.query(
    `SELECT COUNT(*) AS total FROM login_logs WHERE success = 1 AND DATE(created_at) = CURDATE()`
  );
  let trialCount = 0;
  try {
    const [[trials]] = await pool.query(`SELECT COUNT(*) AS total FROM trial_records`);
    trialCount = trials.total;
  } catch {
    /* trial_records table not migrated yet */
  }

  res.json({
    stats: {
      totalUsers: users.total,
      totalForms: trialCount,
      loginsToday: loginsToday.total,
    },
  });
}

export async function getActivityLogs(req, res) {
  const [rows] = await pool.query(
    `SELECT a.*, u.name AS user_name, u.username
     FROM activity_logs a
     LEFT JOIN users u ON u.id = a.user_id
     ORDER BY a.created_at DESC LIMIT 200`
  );
  res.json({ logs: rows });
}

import pool from '../config/db.js';

export async function logActivity({ userId, action, entityType = null, entityId = null, details = null, ip }) {
  await pool.execute(
    `INSERT INTO activity_logs (user_id, action, entity_type, entity_id, details, ip_address)
     VALUES (:userId, :action, :entityType, :entityId, :details, :ip)`,
    {
      userId: userId ?? null,
      action,
      entityType,
      entityId,
      details: details ? JSON.stringify(details) : null,
      ip: ip || null,
    }
  );
}

export async function logLogin({ userId, username, success, failureReason, ip, userAgent }) {
  await pool.execute(
    `INSERT INTO login_logs (user_id, username, ip_address, user_agent, success, failure_reason)
     VALUES (:userId, :username, :ip, :userAgent, :success, :failureReason)`,
    {
      userId: userId ?? null,
      username,
      ip: ip || null,
      userAgent: userAgent || null,
      success: success ? 1 : 0,
      failureReason: failureReason || null,
    }
  );
}

import bcrypt from 'bcrypt';
import pool from '../config/db.js';
import { logActivity } from '../services/activityService.js';
import { sanitizeUserInput, validateUserPayload } from '../middleware/validate.js';

export async function listUsers(req, res) {
  const [rows] = await pool.execute(
    `SELECT id, name, username, employee_id, phone, email, role, status, created_at, updated_at
     FROM users ORDER BY created_at DESC`
  );
  res.json({ users: rows });
}

export async function createUser(req, res) {
  const body = sanitizeUserInput(req.body);
  const errors = validateUserPayload(body);
  if (errors.length) return res.status(400).json({ message: errors.join(', ') });

  const hash = await bcrypt.hash(body.password, 12);
  try {
    const [result] = await pool.execute(
      `INSERT INTO users (name, username, employee_id, phone, email, password, role, status)
       VALUES (:name, :username, :employeeId, :phone, :email, :password, :role, 'active')`,
      {
        name: body.name,
        username: body.username,
        employeeId: body.employee_id || null,
        phone: body.phone || null,
        email: body.email || null,
        password: hash,
        role: body.role || 'user',
      }
    );
    await logActivity({
      userId: req.user.id,
      action: 'user_created',
      entityType: 'user',
      entityId: String(result.insertId),
      ip: req.ip,
      details: { username: body.username, role: body.role || 'user' },
    });
    res.status(201).json({ id: result.insertId, message: 'User created' });
  } catch (e) {
    if (e.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({
        message: e.message?.includes('employee_id')
          ? 'Employee ID already exists'
          : 'Username already exists',
      });
    }
    throw e;
  }
}

export async function updateUser(req, res) {
  const id = Number(req.params.id);
  const body = sanitizeUserInput(req.body);
  const errors = validateUserPayload(body, { isUpdate: true });
  if (errors.length) return res.status(400).json({ message: errors.join(', ') });

  const fields = [];
  const params = { id };
  if (body.name) { fields.push('name = :name'); params.name = body.name; }
  if (body.username) { fields.push('username = :username'); params.username = body.username; }
  if (body.employee_id !== undefined) {
    fields.push('employee_id = :employeeId');
    params.employeeId = body.employee_id || null;
  }
  if (body.phone !== undefined) { fields.push('phone = :phone'); params.phone = body.phone || null; }
  if (body.email !== undefined) { fields.push('email = :email'); params.email = body.email || null; }
  if (body.role) { fields.push('role = :role'); params.role = body.role; }
  if (body.status) { fields.push('status = :status'); params.status = body.status; }
  if (body.password) {
    fields.push('password = :password');
    params.password = await bcrypt.hash(body.password, 12);
  }

  if (!fields.length) return res.status(400).json({ message: 'No fields to update' });

  await pool.execute(`UPDATE users SET ${fields.join(', ')} WHERE id = :id`, params);
  await logActivity({
    userId: req.user.id,
    action: 'user_updated',
    entityType: 'user',
    entityId: String(id),
    ip: req.ip,
  });
  res.json({ message: 'User updated' });
}

export async function deleteUser(req, res) {
  const id = Number(req.params.id);
  if (id === req.user.id) return res.status(400).json({ message: 'Cannot delete your own account' });

  await pool.execute(`UPDATE users SET status = 'disabled' WHERE id = :id`, { id });
  await logActivity({
    userId: req.user.id,
    action: 'user_disabled',
    entityType: 'user',
    entityId: String(id),
    ip: req.ip,
  });
  res.json({ message: 'User disabled' });
}

export async function resetPassword(req, res) {
  const id = Number(req.params.id);
  const { password } = req.body;
  if (!password || password.length < 8) {
    return res.status(400).json({ message: 'Password must be at least 8 characters' });
  }
  const hash = await bcrypt.hash(password, 12);
  await pool.execute('UPDATE users SET password = :password WHERE id = :id', { id, password: hash });
  await logActivity({
    userId: req.user.id,
    action: 'password_reset',
    entityType: 'user',
    entityId: String(id),
    ip: req.ip,
  });
  res.json({ message: 'Password reset' });
}

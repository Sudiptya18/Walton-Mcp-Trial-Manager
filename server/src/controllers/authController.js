import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import pool from '../config/db.js';
import { logActivity, logLogin } from '../services/activityService.js';

function signToken(user) {
  return jwt.sign(
    { id: user.id, username: user.username, role: user.role, name: user.name },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );
}

export async function login(req, res) {
  const { username, password } = req.body;
  const ip = req.ip;
  const userAgent = req.get('user-agent');

  if (!username || !password) {
    return res.status(400).json({ message: 'Username and password required' });
  }

  const uname = String(username).trim().toLowerCase();
  const [rows] = await pool.execute(
    'SELECT id, name, username, employee_id, email, phone, password, role, status FROM users WHERE username = :uname LIMIT 1',
    { uname }
  );

  const user = rows[0];
  if (!user) {
    await logLogin({ username: uname, success: false, failureReason: 'User not found', ip, userAgent });
    return res.status(401).json({ message: 'Invalid credentials' });
  }

  if (user.status !== 'active') {
    await logLogin({ userId: user.id, username: uname, success: false, failureReason: 'Account disabled', ip, userAgent });
    return res.status(403).json({ message: 'Account is disabled' });
  }

  const ok = await bcrypt.compare(password, user.password);
  if (!ok) {
    await logLogin({ userId: user.id, username: uname, success: false, failureReason: 'Wrong password', ip, userAgent });
    return res.status(401).json({ message: 'Invalid credentials' });
  }

  const token = signToken(user);
  await logLogin({ userId: user.id, username: uname, success: true, ip, userAgent });
  await logActivity({ userId: user.id, action: 'login', ip, details: { username: uname } });

  const cookieOpts = {
    httpOnly: true,
    secure: process.env.COOKIE_SECURE === 'true',
    sameSite: 'strict',
    maxAge: 7 * 24 * 60 * 60 * 1000,
  };
  res.cookie('token', token, cookieOpts);

  res.json({
    token,
    user: {
      id: user.id,
      name: user.name,
      username: user.username,
      employee_id: user.employee_id,
      email: user.email,
      phone: user.phone,
      role: user.role,
    },
  });
}

export async function logout(req, res) {
  if (req.user?.id) {
    await logActivity({ userId: req.user.id, action: 'logout', ip: req.ip });
  }
  res.clearCookie('token');
  res.json({ message: 'Logged out' });
}

export async function profile(req, res) {
  const [rows] = await pool.execute(
    'SELECT id, name, username, employee_id, email, phone, role, status, created_at FROM users WHERE id = :id LIMIT 1',
    { id: req.user.id }
  );
  if (!rows[0]) return res.status(404).json({ message: 'User not found' });
  res.json({ user: rows[0] });
}

export async function forgotPassword(req, res) {
  const { email } = req.body;
  if (!email) return res.status(400).json({ message: 'Email required' });
  res.json({
    message: 'If an account exists for this email, an administrator will be notified. Contact your system admin to reset your password.',
  });
}

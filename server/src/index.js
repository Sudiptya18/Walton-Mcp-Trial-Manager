import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import rateLimit from 'express-rate-limit';
import { csrfProtection } from './middleware/csrfProtection.js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { corsOptions } from './config/cors.js';

import authRoutes from './routes/authRoutes.js';
import userRoutes from './routes/userRoutes.js';
import dashboardRoutes from './routes/dashboardRoutes.js';
import trialRoutes from './routes/trialRoutes.js';
import { authenticate } from './middleware/auth.js';
import { logActivity } from './services/activityService.js';

dotenv.config();

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = process.env.PORT || 5000;

app.set('trust proxy', 1);

app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' },
}));
app.use(cors(corsOptions()));
app.use(express.json({ limit: '2mb' }));
app.use(cookieParser());

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 30,
  message: { message: 'Too many login attempts. Try again later.' },
});

app.get('/api/health', (_req, res) => res.json({ ok: true }));

app.get('/api/csrf-token', csrfProtection, (req, res) => {
  res.json({ csrfToken: req.csrfToken() });
});

app.use('/api/auth/login', loginLimiter);
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/trials', trialRoutes);

app.post('/api/activity', authenticate, async (req, res) => {
  const { action, entityType, entityId, details } = req.body;
  if (!action) return res.status(400).json({ message: 'action required' });
  await logActivity({
    userId: req.user.id,
    action,
    entityType,
    entityId,
    details,
    ip: req.ip,
  });
  res.json({ ok: true });
});

app.use((err, req, res, _next) => {
  if (err.code === 'EBADCSRFTOKEN') {
    return res.status(403).json({ message: 'Invalid CSRF token' });
  }
  console.error(err);
  res.status(500).json({ message: 'Internal server error' });
});

app.listen(PORT, () => {
  console.log(`WALTON MCP API running on http://localhost:${PORT}`);
});

function normalizeOrigin(url) {
  if (!url) return '';
  return String(url).trim().replace(/\/$/, '');
}

function buildAllowedOrigins() {
  const list = [
    process.env.CLIENT_URL,
    ...(process.env.CLIENT_URLS || '').split(','),
  ]
    .map(normalizeOrigin)
    .filter(Boolean);
  return new Set(list);
}

const allowedOrigins = buildAllowedOrigins();

/** Vercel production + preview URLs for this project. */
function isVercelClientOrigin(origin) {
  return /^https:\/\/walton-mcp-trial-manager-client[a-z0-9-]*\.vercel\.app$/i.test(origin);
}

export function isAllowedOrigin(origin) {
  if (!origin) return true;
  const o = normalizeOrigin(origin);
  if (allowedOrigins.has(o)) return true;
  if (isVercelClientOrigin(o)) return true;
  return false;
}

export function corsOptions() {
  return {
    origin(origin, callback) {
      if (!origin) return callback(null, true);
      if (isAllowedOrigin(origin)) return callback(null, origin);
      console.warn('[CORS] Blocked origin:', origin, '| allowed:', [...allowedOrigins]);
      callback(null, false);
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-CSRF-Token', 'X-Requested-With'],
    exposedHeaders: ['Set-Cookie'],
    maxAge: 86400,
  };
}

import { serialize } from 'cookie';
import Tokens from 'csrf';

const tokens = new Tokens();
const IGNORE_METHODS = new Set(['GET', 'HEAD', 'OPTIONS']);
const COOKIE_KEY = '_csrf';

function getTokenFromRequest(req) {
  return (
    req.body?._csrf ||
    req.query?._csrf ||
    req.headers['csrf-token'] ||
    req.headers['xsrf-token'] ||
    req.headers['x-csrf-token'] ||
    req.headers['x-xsrf-token']
  );
}

function setSecretCookie(res, secret) {
  const header = serialize(COOKIE_KEY, secret, { path: '/', httpOnly: true, sameSite: 'strict' });
  const prev = res.getHeader('set-cookie') || [];
  res.setHeader('set-cookie', Array.isArray(prev) ? [...prev, header] : [prev, header]);
}

export function csrfProtection(req, res, next) {
  let secret = req.cookies?.[COOKIE_KEY];
  let token;

  req.csrfToken = function csrfToken() {
    if (token && secret) return token;
    if (!secret) {
      secret = tokens.secretSync();
      setSecretCookie(res, secret);
    }
    token = tokens.create(secret);
    return token;
  };

  if (!secret) {
    secret = tokens.secretSync();
    setSecretCookie(res, secret);
  }

  if (!IGNORE_METHODS.has(req.method) && !tokens.verify(secret, getTokenFromRequest(req))) {
    const err = new Error('invalid csrf token');
    err.code = 'EBADCSRFTOKEN';
    err.status = 403;
    return next(err);
  }

  next();
}

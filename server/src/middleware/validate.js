import validator from 'validator';

export function sanitizeUserInput(body) {
  const out = { ...body };
  if (out.name) out.name = validator.escape(validator.trim(out.name));
  if (out.username) out.username = validator.trim(out.username).toLowerCase();
  if (out.email) out.email = validator.normalizeEmail(out.email) || null;
  if (out.phone) out.phone = validator.escape(validator.trim(out.phone || ''));
  if (out.employee_id) out.employee_id = validator.trim(out.employee_id).toUpperCase();
  return out;
}

export function validateUserPayload(body, { isUpdate = false } = {}) {
  const errors = [];
  if (!isUpdate || body.name !== undefined) {
    if (!body.name || body.name.length < 2) errors.push('Full name is required');
  }
  if (!isUpdate || body.username !== undefined) {
    if (!body.username || !/^[a-z0-9._-]{3,60}$/i.test(body.username)) {
      errors.push('Valid username is required');
    }
  }
  if (body.email && !validator.isEmail(body.email)) errors.push('Invalid email');
  if (!isUpdate && (!body.password || body.password.length < 8)) {
    errors.push('Password must be at least 8 characters');
  }
  if (body.role && !['admin', 'user'].includes(body.role)) errors.push('Invalid role');
  if (body.employee_id && !/^[A-Z0-9-]{2,40}$/i.test(body.employee_id)) {
    errors.push('Employee ID must be 2–40 letters, numbers, or hyphens');
  }
  return errors;
}

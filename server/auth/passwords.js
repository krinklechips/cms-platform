import crypto from 'crypto';

const SCRYPT_PREFIX = 'scrypt';
const SCRYPT_PARAMS = {
  N: 16384,
  r: 8,
  p: 1,
  keylen: 64,
};

function timingSafeEqualHex(aHex, bHex) {
  try {
    const a = Buffer.from(aHex, 'hex');
    const b = Buffer.from(bHex, 'hex');
    if (a.length !== b.length) return false;
    return crypto.timingSafeEqual(a, b);
  } catch {
    return false;
  }
}

export function hashPassword(password) {
  const raw = String(password || '');
  if (raw.length < 8) {
    throw new Error('Password must be at least 8 characters');
  }
  const salt = crypto.randomBytes(16);
  const hash = crypto.scryptSync(raw, salt, SCRYPT_PARAMS.keylen, {
    N: SCRYPT_PARAMS.N,
    r: SCRYPT_PARAMS.r,
    p: SCRYPT_PARAMS.p,
  });
  return [
    SCRYPT_PREFIX,
    SCRYPT_PARAMS.N,
    SCRYPT_PARAMS.r,
    SCRYPT_PARAMS.p,
    salt.toString('hex'),
    hash.toString('hex'),
  ].join('$');
}

export function verifyPassword(password, passwordHash) {
  const raw = String(password || '');
  const stored = String(passwordHash || '');
  if (!stored) return false;

  const parts = stored.split('$');
  if (parts.length === 6 && parts[0] === SCRYPT_PREFIX) {
    const N = Number(parts[1]);
    const r = Number(parts[2]);
    const p = Number(parts[3]);
    const saltHex = parts[4];
    const hashHex = parts[5];
    if (!N || !r || !p || !saltHex || !hashHex) return false;
    try {
      const derived = crypto.scryptSync(raw, Buffer.from(saltHex, 'hex'), Buffer.from(hashHex, 'hex').length, { N, r, p });
      return timingSafeEqualHex(derived.toString('hex'), hashHex);
    } catch {
      return false;
    }
  }

  return false;
}


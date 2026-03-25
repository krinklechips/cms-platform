import { Router } from 'express';
import { db } from '../db.js';
import { hashPassword, verifyPassword } from '../auth/passwords.js';
import { requirePlatformHost } from '../middleware/hostContext.js';

const router = Router();

// Real password-based login for platform admins
router.post('/login', requirePlatformHost, (req, res) => {
  const email = String(req.body?.email || '').trim().toLowerCase();
  const password = String(req.body?.password || '');

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }

  const user = db.prepare('SELECT id, email, password_hash, must_change_password FROM users WHERE email = ?').get(email);
  if (!user) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }

  if (!user.password_hash) {
    return res.status(401).json({ error: 'Password not set. Use the set-password endpoint first.' });
  }

  const valid = verifyPassword(password, user.password_hash);
  if (!valid) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }

  const platformAdmin = db.prepare('SELECT role FROM platform_admins WHERE user_id = ?').get(user.id);
  if (!platformAdmin) {
    return res.status(403).json({ error: 'Platform admin access required' });
  }

  req.session.user = {
    id: user.id,
    email: user.email,
    isPlatformAdmin: true,
    platformRole: platformAdmin.role,
  };
  return res.json({
    ok: true,
    user: req.session.user,
    mustChangePassword: user.must_change_password === 1,
  });
});

// One-time password setup (requires bootstrap secret)
router.post('/set-password', requirePlatformHost, (req, res) => {
  const { env } = req.app.locals || {};
  const bootstrapSecret = process.env.PLATFORM_BOOTSTRAP_SECRET;

  const email = String(req.body?.email || '').trim().toLowerCase();
  const secret = String(req.body?.secret || '');
  const newPassword = String(req.body?.newPassword || '');

  if (!email || !secret || !newPassword) {
    return res.status(400).json({ error: 'email, secret, and newPassword are required' });
  }

  if (secret !== bootstrapSecret) {
    return res.status(401).json({ error: 'Invalid bootstrap secret' });
  }

  const user = db.prepare('SELECT id, email, password_hash FROM users WHERE email = ?').get(email);
  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }

  const platformAdmin = db.prepare('SELECT role FROM platform_admins WHERE user_id = ?').get(user.id);
  if (!platformAdmin) {
    return res.status(403).json({ error: 'Platform admin access required' });
  }

  try {
    const hash = hashPassword(newPassword);
    db.prepare('UPDATE users SET password_hash = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?').run(hash, user.id);
    return res.json({ ok: true, message: 'Password set successfully' });
  } catch (err) {
    return res.status(400).json({ error: err.message });
  }
});

// Change password (used when must_change_password = 1 or for regular password updates)
router.post('/change-password', (req, res) => {
  const userId = req.session?.user?.id;
  if (!userId) return res.status(401).json({ error: 'Not authenticated' });

  const newPassword = String(req.body?.newPassword || '');
  if (!newPassword || newPassword.length < 8) {
    return res.status(400).json({ error: 'Password must be at least 8 characters' });
  }

  try {
    const hash = hashPassword(newPassword);
    db.prepare(
      'UPDATE users SET password_hash = ?, must_change_password = 0, updated_at = CURRENT_TIMESTAMP WHERE id = ?'
    ).run(hash, userId);
    return res.json({ ok: true });
  } catch (err) {
    return res.status(400).json({ error: err.message });
  }
});

// Get current authenticated user
router.get('/me', (req, res) => {
  const user = req.session?.user;
  if (!user) return res.json({ authenticated: false });
  return res.json({ authenticated: true, user });
});

// Logout
router.post('/logout', (req, res) => {
  req.session.destroy(() => {
    res.json({ ok: true });
  });
});

export default router;

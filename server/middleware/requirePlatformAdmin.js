import { db } from '../db.js';

export function requirePlatformAdmin(req, res, next) {
  const userId = req.session?.user?.id;
  if (!userId) return res.status(401).json({ error: 'Unauthorized' });

  const admin = db.prepare('SELECT role FROM platform_admins WHERE user_id = ?').get(userId);
  if (!admin) return res.status(403).json({ error: 'Platform admin access required' });

  req.platformAdmin = { userId, role: admin.role };
  return next();
}

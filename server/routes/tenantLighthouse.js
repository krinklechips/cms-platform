import { Router } from 'express';
import { requireTenantContext } from '../middleware/tenantContext.js';
import { db } from '../db.js';

const router = Router();
router.use(requireTenantContext);

function getIntegrations(tenantId) {
  const row = db.prepare('SELECT settings_json FROM tenant_settings WHERE tenant_id = ?').get(tenantId);
  const settings = row ? JSON.parse(row.settings_json || '{}') : {};
  return settings.integrations || {};
}

// GET /api/tenant/lighthouse/history
router.get('/history', (req, res) => {
  const rows = db.prepare(`
    SELECT id, url, strategy, performance_score, accessibility_score,
           best_practices_score, seo_score, created_at
    FROM lighthouse_audits
    WHERE tenant_id = ?
    ORDER BY created_at DESC
    LIMIT 20
  `).all(req.tenant.id);
  res.json({ ok: true, audits: rows });
});

// GET /api/tenant/lighthouse/latest — latest audit per URL
router.get('/latest', (req, res) => {
  const rows = db.prepare(`
    SELECT id, url, strategy, performance_score, accessibility_score,
           best_practices_score, seo_score, result_json, created_at
    FROM lighthouse_audits
    WHERE tenant_id = ?
    ORDER BY created_at DESC
    LIMIT 1
  `).all(req.tenant.id);
  const audit = rows[0] || null;
  if (audit && audit.result_json) {
    try { audit.result = JSON.parse(audit.result_json); } catch {}
    delete audit.result_json;
  }
  res.json({ ok: true, audit });
});

// POST /api/tenant/lighthouse/run
router.post('/run', async (req, res) => {
  const integrations = getIntegrations(req.tenant.id);
  const { url, strategy = 'mobile' } = req.body;

  if (!url) {
    return res.status(400).json({ ok: false, error: 'url is required' });
  }

  try {
    const psiUrl = new URL('https://www.googleapis.com/pagespeedonline/v5/runPagespeed');
    psiUrl.searchParams.set('url', url);
    psiUrl.searchParams.set('strategy', strategy);
    ['performance', 'accessibility', 'best-practices', 'seo'].forEach((c) =>
      psiUrl.searchParams.append('category', c),
    );
    if (integrations.pagespeed?.apiKey) {
      psiUrl.searchParams.set('key', integrations.pagespeed.apiKey);
    }

    const response = await fetch(psiUrl.toString());
    if (!response.ok) {
      const errText = await response.text();
      return res.status(502).json({ ok: false, error: `PageSpeed API error: ${response.status} ${errText.slice(0, 200)}` });
    }

    const data = await response.json();
    const cats = data.lighthouseResult?.categories || {};
    const lhAudits = data.lighthouseResult?.audits || {};

    const perfScore = Math.round((cats.performance?.score ?? 0) * 100);
    const a11yScore = Math.round((cats.accessibility?.score ?? 0) * 100);
    const bpScore = Math.round((cats['best-practices']?.score ?? 0) * 100);
    const seoScore = Math.round((cats.seo?.score ?? 0) * 100);

    // Extract opportunities (items that need improvement)
    const opportunities = Object.values(lhAudits)
      .filter((a) => a.score !== null && a.score < 1 && a.details?.type === 'opportunity')
      .sort((a, b) => (a.score ?? 0) - (b.score ?? 0))
      .slice(0, 10)
      .map((a) => ({
        id: a.id,
        title: a.title,
        description: a.description,
        score: a.score,
        displayValue: a.displayValue || null,
      }));

    // Extract diagnostics (failed audits)
    const diagnostics = Object.values(lhAudits)
      .filter((a) => a.score !== null && a.score < 0.9 && a.details?.type !== 'opportunity')
      .sort((a, b) => (a.score ?? 0) - (b.score ?? 0))
      .slice(0, 10)
      .map((a) => ({
        id: a.id,
        title: a.title,
        description: a.description,
        score: a.score,
        displayValue: a.displayValue || null,
      }));

    const resultJson = JSON.stringify({
      opportunities,
      diagnostics,
      fetchTime: data.lighthouseResult?.fetchTime,
      lighthouseVersion: data.lighthouseResult?.lighthouseVersion,
      userAgent: data.lighthouseResult?.userAgent,
    });

    const now = new Date().toISOString();
    const info = db.prepare(`
      INSERT INTO lighthouse_audits
        (tenant_id, url, strategy, performance_score, accessibility_score, best_practices_score, seo_score, result_json, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(req.tenant.id, url, strategy, perfScore, a11yScore, bpScore, seoScore, resultJson, now);

    res.json({
      ok: true,
      audit: {
        id: info.lastInsertRowid,
        url,
        strategy,
        performanceScore: perfScore,
        accessibilityScore: a11yScore,
        bestPracticesScore: bpScore,
        seoScore,
        opportunities,
        diagnostics,
        createdAt: now,
      },
    });
  } catch (err) {
    console.error('Lighthouse audit error:', err);
    res.status(500).json({ ok: false, error: err.message });
  }
});

export default router;

import express from 'express';
import { requireAuth } from '../middleware/requireAuth.js';
import { requireTenantContext } from '../middleware/tenantContext.js';

const router = express.Router();
router.use(requireAuth);
router.use(requireTenantContext);

function getSupabaseConfig() {
  return {
    url: process.env.SUPABASE_URL,
    key: process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_ANON_KEY,
  };
}

function sbHeaders(key) {
  return {
    'Content-Type': 'application/json',
    'apikey': key,
    'Authorization': `Bearer ${key}`,
    'Prefer': 'return=representation',
  };
}

// ─── Site Stats ───────────────────────────────────────────────────────────────

router.get('/stats', async (req, res) => {
  const { url, key } = getSupabaseConfig();
  if (!url || !key) return res.json([]);
  try {
    const resp = await fetch(`${url}/rest/v1/site_stats?select=*&order=sort_order.asc`, { headers: sbHeaders(key) });
    if (!resp.ok) return res.status(resp.status).json({ error: 'Supabase error' });
    const rows = await resp.json();
    res.json(
      Array.isArray(rows)
        ? rows.map((row) => ({
            key: row.key,
            displayValue: row.display_value,
            numericValue: row.numeric_value,
            suffix: row.suffix,
            label: row.label,
            sortOrder: row.sort_order,
          }))
        : [],
    );
  } catch (err) {
    console.error('[homepage/stats] fetch failed', err);
    res.status(500).json({ error: 'Failed to fetch stats' });
  }
});

router.post('/stats', async (req, res) => {
  const { url, key } = getSupabaseConfig();
  if (!url || !key) return res.status(503).json({ error: 'Supabase not configured' });
  const { key: statKey, display_value, label, numeric_value, suffix, sort_order } = req.body ?? {};
  if (!String(statKey || '').trim()) return res.status(400).json({ error: 'key is required' });
  if (!String(display_value || '').trim()) return res.status(400).json({ error: 'display_value is required' });
  if (!String(label || '').trim()) return res.status(400).json({ error: 'label is required' });
  try {
    const resp = await fetch(`${url}/rest/v1/site_stats`, {
      method: 'POST',
      headers: sbHeaders(key),
      body: JSON.stringify({
        key: String(statKey).trim(),
        display_value: String(display_value).trim(),
        label: String(label).trim(),
        numeric_value: numeric_value != null ? Number(numeric_value) : null,
        suffix: suffix || null,
        sort_order: Number(sort_order) || 0,
      }),
    });
    if (!resp.ok) { const t = await resp.text(); return res.status(resp.status).json({ error: t }); }
    const data = await resp.json();
    const row = Array.isArray(data) ? data[0] : data;
    res.status(201).json({
      key: row.key,
      displayValue: row.display_value,
      numericValue: row.numeric_value,
      suffix: row.suffix,
      label: row.label,
      sortOrder: row.sort_order,
    });
  } catch (err) {
    console.error('[homepage/stats] create failed', err);
    res.status(500).json({ error: 'Failed to create stat' });
  }
});

router.put('/stats/:key', async (req, res) => {
  const { url, key } = getSupabaseConfig();
  if (!url || !key) return res.status(503).json({ error: 'Supabase not configured' });
  const { key: statKey } = req.params;
  const patch = {};
  const body = req.body ?? {};
  if (body.display_value !== undefined) patch.display_value = String(body.display_value).trim();
  if (body.numeric_value !== undefined) patch.numeric_value = body.numeric_value != null ? Number(body.numeric_value) : null;
  if (body.suffix !== undefined) patch.suffix = body.suffix || null;
  if (body.label !== undefined) patch.label = String(body.label).trim();
  if (body.sort_order !== undefined) patch.sort_order = Number(body.sort_order) || 0;
  try {
    const resp = await fetch(`${url}/rest/v1/site_stats?key=eq.${encodeURIComponent(statKey)}`, {
      method: 'PATCH',
      headers: sbHeaders(key),
      body: JSON.stringify(patch),
    });
    if (!resp.ok) return res.status(resp.status).json({ error: 'Supabase error' });
    const data = await resp.json();
    const row = Array.isArray(data) ? data[0] : data;
    res.json({
      key: row.key,
      displayValue: row.display_value,
      numericValue: row.numeric_value,
      suffix: row.suffix,
      label: row.label,
      sortOrder: row.sort_order,
    });
  } catch (err) {
    console.error('[homepage/stats] update failed', err);
    res.status(500).json({ error: 'Failed to update stat' });
  }
});

router.delete('/stats/:key', async (req, res) => {
  const { url, key } = getSupabaseConfig();
  if (!url || !key) return res.status(503).json({ error: 'Supabase not configured' });
  const { key: statKey } = req.params;
  try {
    const resp = await fetch(`${url}/rest/v1/site_stats?key=eq.${encodeURIComponent(statKey)}`, {
      method: 'DELETE',
      headers: sbHeaders(key),
    });
    if (!resp.ok) return res.status(resp.status).json({ error: 'Supabase error' });
    res.json({ ok: true });
  } catch (err) {
    console.error('[homepage/stats] delete failed', err);
    res.status(500).json({ error: 'Failed to delete stat' });
  }
});

// ─── Brand Logos ──────────────────────────────────────────────────────────────

router.get('/brand-logos', async (req, res) => {
  const { url, key } = getSupabaseConfig();
  if (!url || !key) return res.json([]);
  try {
    const resp = await fetch(`${url}/rest/v1/brand_logos?select=*&order=sort_order.asc`, { headers: sbHeaders(key) });
    if (!resp.ok) return res.status(resp.status).json({ error: 'Supabase error' });
    const rows = await resp.json();
    res.json(
      Array.isArray(rows)
        ? rows.map((row) => ({
            id: row.id,
            slug: row.slug,
            name: row.name,
            logoSrc: row.logo_src,
            sortOrder: row.sort_order,
          }))
        : [],
    );
  } catch (err) {
    console.error('[homepage/brand-logos] fetch failed', err);
    res.status(500).json({ error: 'Failed to fetch brand logos' });
  }
});

router.post('/brand-logos', async (req, res) => {
  const { url, key } = getSupabaseConfig();
  if (!url || !key) return res.status(503).json({ error: 'Supabase not configured' });
  const { slug, name, logo_src, sort_order } = req.body ?? {};
  if (!String(slug || '').trim()) return res.status(400).json({ error: 'slug is required' });
  if (!String(name || '').trim()) return res.status(400).json({ error: 'name is required' });
  if (!String(logo_src || '').trim()) return res.status(400).json({ error: 'logo_src is required' });
  try {
    const resp = await fetch(`${url}/rest/v1/brand_logos`, {
      method: 'POST',
      headers: sbHeaders(key),
      body: JSON.stringify({
        slug: String(slug).trim(),
        name: String(name).trim(),
        logo_src: String(logo_src).trim(),
        sort_order: Number(sort_order) || 0,
      }),
    });
    if (!resp.ok) { const t = await resp.text(); return res.status(resp.status).json({ error: t }); }
    const data = await resp.json();
    const row = Array.isArray(data) ? data[0] : data;
    res.status(201).json({ id: row.id, slug: row.slug, name: row.name, logoSrc: row.logo_src, sortOrder: row.sort_order });
  } catch (err) {
    console.error('[homepage/brand-logos] create failed', err);
    res.status(500).json({ error: 'Failed to create brand logo' });
  }
});

router.put('/brand-logos/:id', async (req, res) => {
  const { url, key } = getSupabaseConfig();
  if (!url || !key) return res.status(503).json({ error: 'Supabase not configured' });
  const { id } = req.params;
  const patch = {};
  const body = req.body ?? {};
  if (body.slug !== undefined) patch.slug = String(body.slug).trim();
  if (body.name !== undefined) patch.name = String(body.name).trim();
  if (body.logo_src !== undefined) patch.logo_src = String(body.logo_src).trim();
  if (body.sort_order !== undefined) patch.sort_order = Number(body.sort_order) || 0;
  try {
    const resp = await fetch(`${url}/rest/v1/brand_logos?id=eq.${encodeURIComponent(id)}`, {
      method: 'PATCH',
      headers: sbHeaders(key),
      body: JSON.stringify(patch),
    });
    if (!resp.ok) return res.status(resp.status).json({ error: 'Supabase error' });
    const data = await resp.json();
    const row = Array.isArray(data) ? data[0] : data;
    res.json({ id: row.id, slug: row.slug, name: row.name, logoSrc: row.logo_src, sortOrder: row.sort_order });
  } catch (err) {
    console.error('[homepage/brand-logos] update failed', err);
    res.status(500).json({ error: 'Failed to update brand logo' });
  }
});

router.delete('/brand-logos/:id', async (req, res) => {
  const { url, key } = getSupabaseConfig();
  if (!url || !key) return res.status(503).json({ error: 'Supabase not configured' });
  const { id } = req.params;
  try {
    const resp = await fetch(`${url}/rest/v1/brand_logos?id=eq.${encodeURIComponent(id)}`, {
      method: 'DELETE',
      headers: sbHeaders(key),
    });
    if (!resp.ok) return res.status(resp.status).json({ error: 'Supabase error' });
    res.json({ ok: true });
  } catch (err) {
    console.error('[homepage/brand-logos] delete failed', err);
    res.status(500).json({ error: 'Failed to delete brand logo' });
  }
});

// ─── Homepage Feature Cards ───────────────────────────────────────────────────

router.get('/feature-cards', async (req, res) => {
  const { url, key } = getSupabaseConfig();
  if (!url || !key) return res.json([]);
  try {
    const resp = await fetch(`${url}/rest/v1/homepage_feature_cards?select=*&order=sort_order.asc`, { headers: sbHeaders(key) });
    if (!resp.ok) return res.status(resp.status).json({ error: 'Supabase error' });
    const rows = await resp.json();
    res.json(
      Array.isArray(rows)
        ? rows.map((row) => ({
            id: row.id,
            slug: row.slug,
            title: row.title,
            description: row.description,
            imageSrc: row.image_src,
            imageAlt: row.image_alt,
            href: row.href,
            cta: row.cta,
            sortOrder: row.sort_order,
          }))
        : [],
    );
  } catch (err) {
    console.error('[homepage/feature-cards] fetch failed', err);
    res.status(500).json({ error: 'Failed to fetch feature cards' });
  }
});

router.post('/feature-cards', async (req, res) => {
  const { url, key } = getSupabaseConfig();
  if (!url || !key) return res.status(503).json({ error: 'Supabase not configured' });
  const { slug, title, description, image_src, image_alt, href, cta, sort_order } = req.body ?? {};
  if (!String(slug || '').trim()) return res.status(400).json({ error: 'slug is required' });
  if (!String(title || '').trim()) return res.status(400).json({ error: 'title is required' });
  if (!String(description || '').trim()) return res.status(400).json({ error: 'description is required' });
  if (!String(image_src || '').trim()) return res.status(400).json({ error: 'image_src is required' });
  if (!String(image_alt || '').trim()) return res.status(400).json({ error: 'image_alt is required' });
  if (!String(href || '').trim()) return res.status(400).json({ error: 'href is required' });
  if (!String(cta || '').trim()) return res.status(400).json({ error: 'cta is required' });
  try {
    const resp = await fetch(`${url}/rest/v1/homepage_feature_cards`, {
      method: 'POST',
      headers: sbHeaders(key),
      body: JSON.stringify({
        slug: String(slug).trim(),
        title: String(title).trim(),
        description: String(description).trim(),
        image_src: String(image_src).trim(),
        image_alt: String(image_alt).trim(),
        href: String(href).trim(),
        cta: String(cta).trim(),
        sort_order: Number(sort_order) || 0,
      }),
    });
    if (!resp.ok) { const t = await resp.text(); return res.status(resp.status).json({ error: t }); }
    const data = await resp.json();
    const row = Array.isArray(data) ? data[0] : data;
    res.status(201).json({
      id: row.id, slug: row.slug, title: row.title, description: row.description,
      imageSrc: row.image_src, imageAlt: row.image_alt, href: row.href, cta: row.cta, sortOrder: row.sort_order,
    });
  } catch (err) {
    console.error('[homepage/feature-cards] create failed', err);
    res.status(500).json({ error: 'Failed to create feature card' });
  }
});

router.put('/feature-cards/:id', async (req, res) => {
  const { url, key } = getSupabaseConfig();
  if (!url || !key) return res.status(503).json({ error: 'Supabase not configured' });
  const { id } = req.params;
  const patch = {};
  const body = req.body ?? {};
  if (body.slug !== undefined) patch.slug = String(body.slug).trim();
  if (body.title !== undefined) patch.title = String(body.title).trim();
  if (body.description !== undefined) patch.description = String(body.description).trim();
  if (body.image_src !== undefined) patch.image_src = String(body.image_src).trim();
  if (body.image_alt !== undefined) patch.image_alt = String(body.image_alt).trim();
  if (body.href !== undefined) patch.href = String(body.href).trim();
  if (body.cta !== undefined) patch.cta = String(body.cta).trim();
  if (body.sort_order !== undefined) patch.sort_order = Number(body.sort_order) || 0;
  try {
    const resp = await fetch(`${url}/rest/v1/homepage_feature_cards?id=eq.${encodeURIComponent(id)}`, {
      method: 'PATCH',
      headers: sbHeaders(key),
      body: JSON.stringify(patch),
    });
    if (!resp.ok) return res.status(resp.status).json({ error: 'Supabase error' });
    const data = await resp.json();
    const row = Array.isArray(data) ? data[0] : data;
    res.json({
      id: row.id, slug: row.slug, title: row.title, description: row.description,
      imageSrc: row.image_src, imageAlt: row.image_alt, href: row.href, cta: row.cta, sortOrder: row.sort_order,
    });
  } catch (err) {
    console.error('[homepage/feature-cards] update failed', err);
    res.status(500).json({ error: 'Failed to update feature card' });
  }
});

router.delete('/feature-cards/:id', async (req, res) => {
  const { url, key } = getSupabaseConfig();
  if (!url || !key) return res.status(503).json({ error: 'Supabase not configured' });
  const { id } = req.params;
  try {
    const resp = await fetch(`${url}/rest/v1/homepage_feature_cards?id=eq.${encodeURIComponent(id)}`, {
      method: 'DELETE',
      headers: sbHeaders(key),
    });
    if (!resp.ok) return res.status(resp.status).json({ error: 'Supabase error' });
    res.json({ ok: true });
  } catch (err) {
    console.error('[homepage/feature-cards] delete failed', err);
    res.status(500).json({ error: 'Failed to delete feature card' });
  }
});

export default router;

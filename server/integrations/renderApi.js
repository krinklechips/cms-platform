import { env } from '../config/env.js';

export class RenderApiError extends Error {
  constructor(message, { status = 500, details = null } = {}) {
    super(message);
    this.name = 'RenderApiError';
    this.status = status;
    this.details = details;
  }
}

function configured() {
  return Boolean(env.RENDER_API_TOKEN && env.RENDER_SERVICE_ID);
}

function encodePathPart(value) {
  return encodeURIComponent(String(value || ''));
}

async function request(method, path, body) {
  if (!configured()) {
    throw new RenderApiError('Render API is not configured on this environment.', { status: 503 });
  }
  const res = await fetch(`${env.RENDER_API_BASE_URL}${path}`, {
    method,
    headers: {
      Authorization: `Bearer ${env.RENDER_API_TOKEN}`,
      Accept: 'application/json',
      ...(body ? { 'Content-Type': 'application/json' } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const message =
      data?.message ||
      data?.error ||
      data?.errors?.[0]?.message ||
      `Render API request failed (${res.status})`;
    throw new RenderApiError(message, { status: res.status, details: data });
  }
  return data;
}

export async function renderListCustomDomains() {
  return request('GET', `/services/${encodePathPart(env.RENDER_SERVICE_ID)}/custom-domains`);
}

export async function renderCreateCustomDomain(hostname) {
  return request('POST', `/services/${encodePathPart(env.RENDER_SERVICE_ID)}/custom-domains`, {
    name: String(hostname || '').trim(),
  });
}

export async function renderGetCustomDomain(idOrName) {
  return request(
    'GET',
    `/services/${encodePathPart(env.RENDER_SERVICE_ID)}/custom-domains/${encodePathPart(idOrName)}`,
  );
}

export async function renderVerifyCustomDomain(idOrName) {
  const base = `/services/${encodePathPart(env.RENDER_SERVICE_ID)}/custom-domains/${encodePathPart(idOrName)}`;
  try {
    return await request('POST', `${base}/verify`);
  } catch (err) {
    if (err instanceof RenderApiError && err.status === 404) {
      return request('POST', `${base}/refresh`);
    }
    throw err;
  }
}

export async function renderGetService() {
  return request('GET', `/services/${encodePathPart(env.RENDER_SERVICE_ID)}`);
}

export function isRenderApiConfigured() {
  return configured();
}


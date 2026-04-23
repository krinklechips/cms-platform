import crypto from 'crypto';
import { env } from '../config/env.js';

function sha256Hex(data) {
  return crypto.createHash('sha256').update(data).digest('hex');
}

function hmac(key, value, encoding) {
  const out = crypto.createHmac('sha256', key).update(value).digest();
  return encoding ? out.toString(encoding) : out;
}

export function isR2Configured() {
  return Boolean(
    env.R2_ACCOUNT_ID &&
    env.R2_S3_ENDPOINT &&
    env.R2_BUCKET_NAME &&
    env.R2_ACCESS_KEY_ID &&
    env.R2_SECRET_ACCESS_KEY,
  );
}

export function getR2ConfigSummary() {
  return {
    configured: isR2Configured(),
    bucketName: env.R2_BUCKET_NAME || null,
    endpoint: env.R2_S3_ENDPOINT || null,
    publicBaseUrl: env.R2_PUBLIC_BASE_URL || null,
    backupPrefix: env.R2_DB_BACKUP_PREFIX || 'cms-platform/backups/db',
  };
}

async function r2Request({ method, objectKey, body, contentType = '', contentLength = 0 }) {
  if (!isR2Configured()) {
    throw new Error('R2 is not configured');
  }

  const endpoint = env.R2_S3_ENDPOINT.replace(/\/$/, '');
  const bucket = env.R2_BUCKET_NAME;
  const host = new URL(endpoint).host;
  const encodedKey = String(objectKey || '')
    .split('/')
    .map((segment) => encodeURIComponent(segment))
    .join('/');
  const pathname = `/${bucket}/${encodedKey}`;
  const url = `${endpoint}${pathname}`;

  const now = new Date();
  const amzDate = now.toISOString().replace(/[:-]|\.\d{3}/g, '');
  const dateStamp = amzDate.slice(0, 8);
  const region = 'auto';
  const service = 's3';
  const algorithm = 'AWS4-HMAC-SHA256';
  const credentialScope = `${dateStamp}/${region}/${service}/aws4_request`;
  const payloadHash = body ? sha256Hex(body) : sha256Hex('');

  const headers = {
    host,
    'x-amz-content-sha256': payloadHash,
    'x-amz-date': amzDate,
  };
  if (contentType) headers['content-type'] = contentType;
  if (contentLength) headers['content-length'] = String(contentLength);

  const sortedHeaderKeys = Object.keys(headers).sort((a, b) => String(a).localeCompare(String(b)));
  const canonicalHeaders = sortedHeaderKeys.map((k) => `${k}:${String(headers[k]).trim()}\n`).join('');
  const signedHeaders = sortedHeaderKeys.join(';');

  const canonicalRequest = [method, pathname, '', canonicalHeaders, signedHeaders, payloadHash].join('\n');
  const stringToSign = [algorithm, amzDate, credentialScope, sha256Hex(canonicalRequest)].join('\n');

  const kDate = hmac(`AWS4${env.R2_SECRET_ACCESS_KEY}`, dateStamp);
  const kRegion = hmac(kDate, region);
  const kService = hmac(kRegion, service);
  const kSigning = hmac(kService, 'aws4_request');
  const signature = hmac(kSigning, stringToSign, 'hex');

  headers.authorization =
    `${algorithm} Credential=${env.R2_ACCESS_KEY_ID}/${credentialScope}, ` +
    `SignedHeaders=${signedHeaders}, Signature=${signature}`;

  return fetch(url, {
    method,
    headers,
    body: body ?? undefined,
  });
}

/**
 * List objects in R2 bucket under a given prefix.
 * Uses S3 ListObjectsV2 API.
 */
export async function listR2Objects(prefix = '', delimiter = '/') {
  if (!isR2Configured()) throw new Error('R2 is not configured');

  const endpoint = env.R2_S3_ENDPOINT.replace(/\/$/, '');
  const bucket = env.R2_BUCKET_NAME;
  const host = new URL(endpoint).host;

  // Query params MUST be sorted alphabetically for AWS SigV4 canonical request
  const params = [
    ['delimiter', delimiter],
    ['list-type', '2'],
    ['max-keys', '1000'],
    ['prefix', prefix],
  ];
  params.sort((a, b) => a[0].localeCompare(b[0]));
  const canonicalQueryString = params
    .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(v)}`)
    .join('&');
  const pathname = `/${bucket}`;
  const url = `${endpoint}${pathname}?${canonicalQueryString}`;

  const now = new Date();
  const amzDate = now.toISOString().replace(/[:-]|\.\d{3}/g, '');
  const dateStamp = amzDate.slice(0, 8);
  const region = 'auto';
  const service = 's3';
  const algorithm = 'AWS4-HMAC-SHA256';
  const credentialScope = `${dateStamp}/${region}/${service}/aws4_request`;
  const payloadHash = sha256Hex('');

  const headers = {
    host,
    'x-amz-content-sha256': payloadHash,
    'x-amz-date': amzDate,
  };

  const sortedHeaderKeys = Object.keys(headers).sort((a, b) => String(a).localeCompare(String(b)));
  const canonicalHeaders = sortedHeaderKeys.map((k) => `${k}:${String(headers[k]).trim()}\n`).join('');
  const signedHeaders = sortedHeaderKeys.join(';');

  const canonicalRequest = ['GET', pathname, canonicalQueryString, canonicalHeaders, signedHeaders, payloadHash].join('\n');
  const stringToSign = [algorithm, amzDate, credentialScope, sha256Hex(canonicalRequest)].join('\n');

  const kDate = hmac(`AWS4${env.R2_SECRET_ACCESS_KEY}`, dateStamp);
  const kRegion = hmac(kDate, region);
  const kService = hmac(kRegion, service);
  const kSigning = hmac(kService, 'aws4_request');
  const signature = hmac(kSigning, stringToSign, 'hex');

  headers.authorization =
    `${algorithm} Credential=${env.R2_ACCESS_KEY_ID}/${credentialScope}, ` +
    `SignedHeaders=${signedHeaders}, Signature=${signature}`;

  const res = await fetch(url, { method: 'GET', headers });
  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`R2 list failed (${res.status})${text ? `: ${text.slice(0, 300)}` : ''}`);
  }

  const xml = await res.text();

  // Parse folders (CommonPrefixes)
  const folders = [];
  const prefixRegex = /<CommonPrefixes>\s*<Prefix>([^<]+)<\/Prefix>\s*<\/CommonPrefixes>/g;
  let match;
  while ((match = prefixRegex.exec(xml)) !== null) {
    folders.push(match[1]);
  }

  // Parse files (Contents)
  const files = [];
  const contentsRegex = /<Contents>([\s\S]*?)<\/Contents>/g;
  while ((match = contentsRegex.exec(xml)) !== null) {
    const block = match[1];
    const key = block.match(/<Key>([^<]+)<\/Key>/)?.[1] || '';
    const size = parseInt(block.match(/<Size>(\d+)<\/Size>/)?.[1] || '0', 10);
    const lastModified = block.match(/<LastModified>([^<]+)<\/LastModified>/)?.[1] || '';
    // Skip folder markers (zero-byte objects ending with /)
    if (key && !key.endsWith('/')) {
      files.push({ key, size, lastModified });
    }
  }

  return { folders, files };
}

export async function uploadBufferToR2({ objectKey, bytes, contentType = 'application/octet-stream' }) {
  if (!(bytes instanceof Uint8Array) && !Buffer.isBuffer(bytes)) {
    throw new Error('bytes must be a Buffer or Uint8Array');
  }
  const body = Buffer.isBuffer(bytes) ? bytes : Buffer.from(bytes);
  const res = await r2Request({
    method: 'PUT',
    objectKey,
    body,
    contentType,
    contentLength: body.length,
  });
  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`R2 upload failed (${res.status})${text ? `: ${text.slice(0, 200)}` : ''}`);
  }
  return { objectKey, size: body.length, etag: res.headers.get('etag') || null };
}

export async function headR2Object(objectKey) {
  const res = await r2Request({ method: 'HEAD', objectKey });
  return {
    ok: res.ok,
    status: res.status,
    etag: res.headers.get('etag') || null,
    contentLength: Number(res.headers.get('content-length') || 0) || 0,
  };
}

export async function deleteR2Object(objectKey) {
  const res = await r2Request({ method: 'DELETE', objectKey });
  if (!res.ok && res.status !== 404) {
    const text = await res.text().catch(() => '');
    throw new Error(`R2 delete failed (${res.status})${text ? `: ${text.slice(0, 200)}` : ''}`);
  }
  return { ok: true };
}


import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { readFile } from 'node:fs/promises';
import { test } from 'node:test';

const require = createRequire(new URL('../client/package.json', import.meta.url));
const ts = require('typescript');

async function importTypeScriptModule(path) {
  const source = await readFile(path, 'utf8');
  const compiled = ts.transpileModule(source, {
    compilerOptions: {
      module: ts.ModuleKind.ES2022,
      target: ts.ScriptTarget.ES2022,
    },
  }).outputText;
  return import(`data:text/javascript;charset=utf-8,${encodeURIComponent(compiled)}`);
}

const { buildPagePath, buildSitePreviewUrl, getTenantPublicSiteUrl } = await importTypeScriptModule(
  new URL('../client/src/app/pages/tenant/page-preview-url.ts', import.meta.url),
);

const pages = [
  { id: 0, title: 'Home', slug: 'home', parentId: null },
  { id: 1, title: 'Services', slug: 'services', parentId: null },
  { id: 2, title: 'Crowns & Bridges', slug: 'services/dental-crowns', parentId: 1 },
  { id: 3, title: 'Orthodontics', slug: 'orthodontics', parentId: 1 },
  { id: 4, title: 'About', slug: 'about', parentId: null },
  { id: 5, title: 'Community & Charity', slug: 'about-community', parentId: 4 },
];

test('maps the CMS home slug to the public site root', () => {
  assert.equal(buildPagePath(pages, 'home', null), '/');
});

test('does not duplicate parent paths when the page slug already contains the full route', () => {
  assert.equal(buildPagePath(pages, 'services/dental-crowns', 1), '/services/dental-crowns');
});

test('prefixes parent paths when the page slug is relative', () => {
  assert.equal(buildPagePath(pages, 'orthodontics', 1), '/services/orthodontics');
});

test('maps known legacy CMS slugs to their current public routes', () => {
  assert.equal(buildPagePath(pages, 'about-community', 4), '/about/community');
});

test('builds a public preview URL from the tenant site URL and cache-bust revision', () => {
  assert.equal(
    buildSitePreviewUrl('https://roomchang.com/', '/services/dental-crowns', 7),
    'https://roomchang.com/services/dental-crowns?cmsPreview=7',
  );
});

test('accepts tenant site URLs stored without a protocol', () => {
  assert.equal(
    buildSitePreviewUrl('roomchang.vercel.app', '/services/dental-crowns', 8),
    'https://roomchang.vercel.app/services/dental-crowns?cmsPreview=8',
  );
});

test('reads the public site URL from the tenant API camelCase branding shape', () => {
  assert.equal(
    getTenantPublicSiteUrl({
      branding: {
        publicSiteUrl: 'roomchang.vercel.app',
      },
    }),
    'roomchang.vercel.app',
  );
});

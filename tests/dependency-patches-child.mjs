import assert from 'node:assert/strict'
import { spawnSync } from 'node:child_process'
import { createHash, randomUUID } from 'node:crypto'
import { mkdtemp, rm, writeFile } from 'node:fs/promises'
import { createServer } from 'node:http'
import { createRequire } from 'node:module'
import net from 'node:net'
import os from 'node:os'
import path from 'node:path'
import { setTimeout as delay } from 'node:timers/promises'
import { pathToFileURL } from 'node:url'

const require = createRequire(import.meta.url)
const fromPayload = createRequire(require.resolve('payload'))
const undici = fromPayload('undici')
const payloadFile = name => pathToFileURL(path.join(path.dirname(require.resolve('payload')), name)).href
const scenario = process.argv[2]

async function withPeer(handler, run) {
  const server = createServer(handler)
  server.on('clientError', (_error, socket) => socket.destroy())
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve))
  try {
    await run(`http://127.0.0.1:${server.address().port}`)
  } finally {
    server.closeAllConnections()
    await new Promise(resolve => server.close(resolve))
  }
}

// Keep the actual SSRF interceptor, then route its accepted test-only public IP to loopback.
async function withSafePeer(handler, run) {
  const { safeFetch, _internal_safeFetchGlobal } = await import(payloadFile('uploads/safeFetch.js'))
  const originalConnect = net.connect
  const originalLookup = _internal_safeFetchGlobal.lookup
  const publicIP = '93.184.216.34'
  let lookups = 0
  _internal_safeFetchGlobal.lookup = (hostname, options, callback) => {
    assert.equal(hostname, 'dependency.example.invalid')
    lookups++
    callback(null, options.all ? [{ address: publicIP, family: 4 }] : publicIP, 4)
  }
  net.connect = function (options, ...args) {
    assert.equal(options.host, 'dependency.example.invalid')
    const filteredLookup = options.lookup
    return originalConnect.call(this, { ...options, lookup: (hostname, settings, callback) => {
      filteredLookup(hostname, settings, (error, address, family) => {
        if (error) return callback(error)
        assert.deepEqual(address, settings.all ? [{ address: publicIP, family: 4 }] : publicIP)
        callback(null, settings.all ? [{ address: '127.0.0.1', family: 4 }] : '127.0.0.1', family)
      })
    } }, ...args)
  }
  try {
    await withPeer(handler, local => run(local.replace('127.0.0.1', 'dependency.example.invalid'), safeFetch))
    assert.ok(lookups > 0)
  } finally {
    net.connect = originalConnect
    _internal_safeFetchGlobal.lookup = originalLookup
  }
}

if (scenario === 'malformed-response') {
  await withSafePeer((_request, response) => {
    response.writeHead(200, { 'Content-Encoding': 'gzip, gzip, gzip, gzip, gzip, gzip', 'Content-Length': '100' })
    response.flushHeaders()
    response.socket.end()
  }, async (url, safeFetch) => {
    await assert.rejects(safeFetch(url, { signal: AbortSignal.timeout(2000) }), /fetch|encoding/i)
    // The vulnerable version rejects first, then emits an uncaught orphan-stream error.
    await delay(150)
  })
} else if (scenario === 'integrity') {
  await withPeer((_request, response) => response.end('Roomchang'), async url => {
    const correct = createHash('sha256').update('Roomchang').digest('base64')
    const incorrect = createHash('sha256').update('different').digest('base64')
    for (const algorithm of ['sha256', 'SHA256', 'Sha256']) {
      const response = await undici.fetch(url, { integrity: `${algorithm}-${correct}`, signal: AbortSignal.timeout(2000) })
      assert.equal(await response.text(), 'Roomchang')
      await assert.rejects(undici.fetch(url, { integrity: `${algorithm}-${incorrect}`, signal: AbortSignal.timeout(2000) }), /fetch failed/)
    }
  })
} else if (scenario === 'upload') {
  const { sqliteAdapter } = await import('@payloadcms/db-sqlite')
  const { buildConfig, getPayload } = await import('payload')
  const dir = await mkdtemp(path.join(os.tmpdir(), 'dependency-upload-'))
  const image = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+jRZkAAAAASUVORK5CYII=', 'base64')
  const payload = await getPayload({ key: randomUUID(), config: buildConfig({
    secret: 'dependency-disposable-fixture-only', telemetry: false, typescript: { autoGenerate: false },
    db: sqliteAdapter({ client: { url: `file:${path.join(dir, 'fixture.db')}` } }),
    collections: [{ slug: 'media', fields: [{ name: 'alt', type: 'text' }], upload: { staticDir: path.join(dir, 'media'), mimeTypes: ['image/png'] } }],
  }) })
  try {
    await withSafePeer((request, response) => {
      assert.equal(request.headers.cookie, 'other=retained')
      response.writeHead(200, { 'Content-Type': 'image/png', 'Content-Length': String(image.length) })
      response.end(image)
    }, async url => {
      const remote = await payload.create({ collection: 'media', data: { alt: 'Remote', filename: 'remote.png', url },
        req: { headers: new Headers({ cookie: 'payload-token=fixture-only;other=retained' }) } })
      assert.equal(remote.filename, 'remote.png')
      assert.equal(remote.mimeType, 'image/png')
      assert.equal(remote.filesize, image.length)
      const local = await payload.create({ collection: 'media', data: { alt: 'Local' }, file: {
        name: 'local.png', data: image, mimetype: 'image/png', size: image.length,
      } })
      assert.equal(local.filename, 'local.png')
      assert.equal((await payload.find({ collection: 'media' })).totalDocs, 2)
      assert.equal((await payload.findByID({ collection: 'media', id: remote.id })).alt, 'Remote')
    })
  } finally {
    await payload.destroy()
    await rm(dir, { recursive: true, force: true })
  }
} else if (scenario === 'ssrf') {
  const { safeFetch, _internal_safeFetchGlobal } = await import(payloadFile('uploads/safeFetch.js'))
  let hits = 0
  await withPeer((_request, response) => { hits++; response.end('private') }, async url => {
    for (const host of ['127.0.0.1', '[::1]', '10.0.0.1', '169.254.169.254', '0x7f000001']) {
      await assert.rejects(safeFetch(url.replace('127.0.0.1', host), { signal: AbortSignal.timeout(1000) }), /unsafe|private|internal/i)
    }
    _internal_safeFetchGlobal.lookup = (_hostname, options, callback) => callback(null, options.all
      ? [{ address: '93.184.216.34', family: 4 }, { address: '127.0.0.1', family: 4 }] : '127.0.0.1', 4)
    await assert.rejects(safeFetch(url.replace('127.0.0.1', 'mixed.example.invalid')), /unsafe|private|internal/i)
    assert.equal(hits, 0)
  })
  await withSafePeer((request, response) => {
    if (request.url === '/redirect') { response.writeHead(302, { Location: 'http://127.0.0.1/private' }); response.end() }
    else if (request.url === '/missing') { response.writeHead(404); response.end('missing') }
    // /timeout deliberately never responds; AbortSignal must bound it.
  }, async (url, fetch) => {
    const redirect = await fetch(`${url}/redirect`, { signal: AbortSignal.timeout(2000) })
    assert.equal(redirect.status, 302)
    await redirect.body.cancel()
    const { getExternalFile } = await import(payloadFile('uploads/getExternalFile.js'))
    const req = { headers: new Headers(), payload: { config: { cookiePrefix: 'payload', serverURL: '' } } }
    await assert.rejects(getExternalFile({ data: { url: `${url}/redirect`, filename: 'blocked.png' }, req, uploadConfig: {} }), /unsafe|private|internal/i)
    await assert.rejects(getExternalFile({ data: { url: `${url}/missing`, filename: 'missing.png' }, req, uploadConfig: {} }), /Failed to fetch file/)
    await assert.rejects(fetch(`${url}/timeout`, { signal: AbortSignal.timeout(100) }), /abort|timeout/i)
    await assert.rejects(getExternalFile({ data: { url: 'file:///etc/passwd', filename: 'blocked.png' }, req, uploadConfig: {} }), /HTTP or HTTPS/)
  })
} else if (scenario === 'headless') {
  const { createHeadlessEditor } = await import('@payloadcms/richtext-lexical/lexical/headless')
  const { withDOM } = await import('@lexical/headless/dom')
  const { $generateNodesFromDOM, $generateHtmlFromNodes } = await import('@lexical/html')
  const { $getRoot } = await import('lexical')
  const { HeadingNode, QuoteNode } = await import('@lexical/rich-text')
  const { ListNode, ListItemNode } = await import('@lexical/list')
  const { LinkNode, AutoLinkNode } = await import('@lexical/link')
  const { convertLexicalToHTML } = await import('@payloadcms/richtext-lexical/html')
  const editor = createHeadlessEditor({ namespace: 'dependency-fixture', nodes: [HeadingNode, QuoteNode, ListNode, ListItemNode, LinkNode, AutoLinkNode], onError: error => { throw error } })
  const originalDocument = globalThis.document
  const html = '<h2>Roomchang</h2><p>Hello <strong>staff</strong> <em>care</em> \u1781\u17d2\u1798\u17c2\u179a \u4e2d\u6587</p><ul><li>First</li><li>Second</li></ul><p><a href="https://roomchang.example.invalid/care">Care</a></p>'
  withDOM(window => {
    assert.equal(window.document, globalThis.document)
    const document = new window.DOMParser().parseFromString(html, 'text/html')
    editor.update(() => $getRoot().append(...$generateNodesFromDOM(editor, document)), { discrete: true })
    editor.getEditorState().read(() => {
      assert.match($getRoot().getTextContent(), /Hello staff care \u1781\u17d2\u1798\u17c2\u179a \u4e2d\u6587/)
      const exported = new window.DOMParser().parseFromString($generateHtmlFromNodes(editor), 'text/html')
      assert.equal(exported.querySelector('h2').textContent, 'Roomchang')
      assert.equal(exported.querySelector('b, strong').textContent, 'staff')
      assert.equal(exported.querySelector('i, em').textContent, 'care')
      assert.equal(exported.querySelectorAll('li').length, 2)
      assert.equal(exported.querySelector('a').getAttribute('href'), 'https://roomchang.example.invalid/care')
    })
    const saved = editor.getEditorState().toJSON()
    editor.setEditorState(editor.parseEditorState(JSON.stringify(saved)))
    assert.deepEqual(editor.getEditorState().toJSON(), saved)
    const rendered = convertLexicalToHTML({ data: saved })
    assert.match(rendered, /<h2>Roomchang<\/h2>/)
    assert.match(rendered, /<strong>staff<\/strong>/)
    assert.match(rendered, /\u4e2d\u6587/)
    assert.doesNotMatch(rendered, /unknown node/)
  })
  assert.equal(globalThis.document, originalDocument)
  assert.throws(() => withDOM(() => { throw new Error('restore globals') }), /restore globals/)
  assert.equal(globalThis.document, originalDocument)
} else if (scenario === 'module-alias') {
  // DOM emulation is not a sandbox. Only this disposable, bounded child enables evaluation.
  const fromHeadless = createRequire(require.resolve('@lexical/headless'))
  const { Window } = await import(pathToFileURL(fromHeadless.resolve('happy-dom')).href)
  const dir = await mkdtemp(path.join(os.tmpdir(), 'dependency-module-'))
  const malicious = 'import { missing as injected = globalThis.constructor.constructor(`return process`)().__dependencyAliasExecuted = true } from "./dep.json" with { type: "json" };'
  const syntax = spawnSync(process.execPath, ['--check', '--input-type=module'], { input: malicious, encoding: 'utf8', timeout: 2000 })
  assert.equal(syntax.status, 1)
  assert.match(syntax.stderr, /SyntaxError/)
  try {
    await writeFile(path.join(dir, 'dep.json'), '{}')
    await writeFile(path.join(dir, 'dep.js'), 'export const value = 42;')
    for (const enabled of [false, true]) {
      const window = new Window({ url: 'https://dependency.example.invalid/', settings: {
        enableJavaScriptEvaluation: enabled, suppressCodeGenerationFromStringsWarning: true,
        fetch: { virtualServers: [{ url: 'https://dependency.example.invalid/', directory: dir }] },
      } })
      try {
        for (const source of ['import { value as answer } from "./dep.js"; globalThis.legitimateAnswer = answer;', malicious]) {
          const script = window.document.createElement('script')
          script.type = 'module'
          script.textContent = source
          window.document.body.append(script)
          await window.happyDOM.waitUntilComplete()
        }
        assert.equal(window.legitimateAnswer, enabled ? 42 : undefined)
        assert.equal(process.__dependencyAliasExecuted, undefined, 'invalid import alias reached the host process')
      } finally { await window.happyDOM.close() }
    }
  } finally { await rm(dir, { recursive: true, force: true }) }
} else {
  throw new Error(`Unknown dependency scenario: ${scenario}`)
}

console.log(`PASS ${scenario}`)
// Payload's private dispatcher has no close API; this child owns all remaining handles.
process.exit(0)

import assert from 'node:assert/strict'
import { spawn } from 'node:child_process'
import { existsSync } from 'node:fs'
import { mkdtemp, rm } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { StringDecoder } from 'node:string_decoder'
import type { Readable, Writable } from 'node:stream'

export const chromiumExecutable = process.env.ROOMCHANG_TYPOGRAPHY_BROWSER ?? [
  '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  '/usr/bin/chromium', '/usr/bin/chromium-browser', '/usr/bin/google-chrome',
].find(existsSync)

type Reply = { id?: number; result?: Record<string, unknown>; error?: { message: string } }
type Pending = { resolve: (value: Record<string, unknown>) => void; reject: (error: Error) => void; timer: NodeJS.Timeout }

async function launchBrowser() {
  assert.ok(chromiumExecutable && existsSync(chromiumExecutable), 'Chromium required: set ROOMCHANG_TYPOGRAPHY_BROWSER or use scripts/test-typography.mjs --browser <executable>.')
  const directory = await mkdtemp(join(tmpdir(), 'typography-chromium-'))
  const child = spawn(chromiumExecutable, [
    '--headless=new', '--remote-debugging-pipe', '--no-startup-window', '--no-first-run',
    '--no-default-browser-check', '--disable-background-networking', '--disable-component-update',
    '--disable-sync', '--disable-extensions', '--disable-default-apps', '--password-store=basic',
    '--use-mock-keychain', '--host-resolver-rules=MAP * ~NOTFOUND', `--user-data-dir=${directory}`,
  ], { stdio: ['ignore', 'ignore', 'pipe', 'pipe', 'pipe'],
    env: { HOME: directory, PATH: process.env.PATH, TMPDIR: directory, NODE_ENV: 'test' } })
  const exited = new Promise<void>(resolve => child.once('exit', () => resolve()))
  const input = child.stdio[3] as Writable
  const output = child.stdio[4] as Readable
  const pending = new Map<number, Pending>()
  const decoder = new StringDecoder('utf8')
  let buffer = ''
  let stderr = ''
  let id = 0
  child.stderr?.on('data', chunk => { stderr = `${stderr}${chunk}`.slice(-4000) })
  const fail = (error: Error) => {
    for (const request of pending.values()) { clearTimeout(request.timer); request.reject(error) }
    pending.clear()
  }
  child.once('error', fail)
  child.once('exit', () => fail(new Error(`Typography Chromium exited. ${stderr}`)))
  output.on('data', chunk => {
    buffer += decoder.write(chunk)
    let end: number
    while ((end = buffer.indexOf('\0')) >= 0) {
      const message = JSON.parse(buffer.slice(0, end)) as Reply
      buffer = buffer.slice(end + 1)
      if (!message.id) continue
      const request = pending.get(message.id)
      if (!request) continue
      pending.delete(message.id); clearTimeout(request.timer)
      if (message.error) request.reject(new Error(message.error.message))
      else request.resolve(message.result ?? {})
    }
  })
  const send = (method: string, params: Record<string, unknown> = {}, sessionId?: string) => new Promise<Record<string, unknown>>((resolve, reject) => {
    const requestID = ++id
    const timer = setTimeout(() => { pending.delete(requestID); reject(new Error(`Chromium timed out: ${method}`)) }, 15000)
    pending.set(requestID, { resolve, reject, timer })
    input.write(`${JSON.stringify({ id: requestID, method, params, sessionId })}\0`)
  })
  const close = async () => {
    try {
      if (child.exitCode === null && child.signalCode === null) {
        await send('Browser.close').catch(() => undefined)
        let timer: NodeJS.Timeout | undefined
        await Promise.race([exited, new Promise<void>(resolve => {
          timer = setTimeout(() => { child.kill('SIGKILL'); resolve() }, 3000)
        })])
        if (timer) clearTimeout(timer)
        await exited
      }
    } finally { await rm(directory, { recursive: true, force: true }) }
  }
  try {
    const version = await send('Browser.getVersion')
    return { send, close, version }
  } catch (error) { await close(); throw error }
}

let browser: ReturnType<typeof launchBrowser> | undefined
const pages = new Set<TypographyPage>()

export type TypographyPage = {
  evaluate: <T>(expression: string) => Promise<T>
  close: () => Promise<void>
}

/** Real browser DOM/CSS only. No stylesheet, selector, media or computed-style rewrites. */
export async function typographyPage(markup: string, css = '', width = 1366): Promise<TypographyPage> {
  const instance = await (browser ??= launchBrowser())
  const { targetId } = await instance.send('Target.createTarget', { url: 'about:blank' })
  const { sessionId } = await instance.send('Target.attachToTarget', { targetId, flatten: true })
  const send = (method: string, params: Record<string, unknown> = {}) => instance.send(method, params, String(sessionId))
  const page: TypographyPage = {
    evaluate: async <T>(expression: string): Promise<T> => {
      const result = await send('Runtime.evaluate', { expression, awaitPromise: true, returnByValue: true })
      assert.ok(!result.exceptionDetails, JSON.stringify(result.exceptionDetails))
      return (result.result as { value: T }).value
    },
    close: async () => { pages.delete(page); await instance.send('Target.closeTarget', { targetId }) },
  }
  pages.add(page)
  await send('Page.enable')
  await send('Network.enable')
  await send('Network.setBlockedURLs', { urls: ['*'] })
  await send('Emulation.setDeviceMetricsOverride', { width, height: 900, deviceScaleFactor: 1, mobile: false })
  const tree = await send('Page.getFrameTree')
  const { frame } = tree.frameTree as { frame: { id: string } }
  await send('Page.setDocumentContent', { frameId: frame.id, html: `<!doctype html>${markup}` })
  await page.evaluate(`(() => { const style = document.createElement('style'); style.textContent = ${JSON.stringify(css)}; document.head.append(style); })()`)
  return page
}

export async function typographyBrowserVersion() {
  return (await (browser ??= launchBrowser())).version
}

export async function closeTypographyPages(): Promise<void> {
  await Promise.all([...pages].map(page => page.close()))
}

export async function closeTypographyBrowser(): Promise<void> {
  if (browser) {
    try { await (await browser).close() } finally { browser = undefined; pages.clear() }
  }
}

import * as nodeModule from 'node:module'
import type { SanitizedConfig } from 'payload'

let lexicalReady: Promise<void> | undefined

async function prepareLexical(): Promise<void> {
  // Match Payload's CLI: avoid Lexical 0.50's top-level dynamic Node imports under tsx.
  const loader = new URL('../lexicalLoader.mjs', import.meta.resolve('payload'))
  const condition = process.env.NODE_ENV === 'production' ? 'production' : 'development'
  if (typeof nodeModule.registerHooks === 'function') {
    const { initialize, resolve } = await import(loader.href)
    initialize(condition)
    nodeModule.registerHooks({ resolve(specifier, context, nextResolve) {
      const result = resolve(specifier, context, nextResolve)
      if (specifier === 'lexical' || specifier.startsWith('lexical/') || specifier.startsWith('@lexical/')) {
        const url = new URL(result.url)
        // tsx can retain the Node entry despite the CLI's added condition.
        if (url.pathname.endsWith('.node.mjs')) {
          const selected = context.conditions.includes('production') ? 'prod'
            : context.conditions.includes('development') ? 'dev' : condition === 'production' ? 'prod' : 'dev'
          url.pathname = url.pathname.slice(0, -'.node.mjs'.length) + `.${selected}.mjs`
          return { ...result, url: url.href }
        }
      }
      return result
    } })
  } else {
    nodeModule.register(loader, import.meta.url, { data: condition })
  }
}

export async function loadPayloadConfig(): Promise<SanitizedConfig> {
  await (lexicalReady ??= prepareLexical())
  return (await import('../../src/payload.config')).default
}

import { readFileSync } from 'node:fs'

const args = process.argv.slice(2)
const actual = process.versions.node

if (args.length === 1 && (args[0] === '--help' || args[0] === '-h')) {
  console.log('Usage: node scripts/verify-runtime.mjs\nVerifies the running Node version against .node-version before startup.')
} else if (args.length > 0) {
  console.error('verify-runtime: unsupported arguments; refusing startup. Use --help for usage.')
  process.exitCode = 1
} else {
  try {
    const expected = readFileSync(new URL('../.node-version', import.meta.url), 'utf8').trim()
    if (!/^(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)$/.test(expected)) {
      throw new Error('Invalid exact Node pin')
    }
    console.log(`verify-runtime: actual=v${actual} expected=v${expected}`)
    if (actual !== expected) {
      console.error('verify-runtime: Node version mismatch; refusing startup before migrations.')
      process.exitCode = 1
    }
  } catch {
    console.error(`verify-runtime: cannot read an exact Node version from .node-version; refusing startup (actual=v${actual}).`)
    process.exitCode = 1
  }
}

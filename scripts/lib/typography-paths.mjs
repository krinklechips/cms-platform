import { mkdirSync, readFileSync, realpathSync, statSync, writeFileSync } from 'node:fs'
import { isAbsolute, join, relative, resolve } from 'node:path'

export function typographySource(root, file) {
  const checkout = realpathSync(root)
  const source = realpathSync(resolve(checkout, file))
  const within = relative(checkout, source)
  if (within === '..' || within.startsWith('../') || isAbsolute(within) || !statSync(source).isFile()) {
    throw new Error('Typography source must be a file inside its checkout.')
  }
  return source
}

export function typographySiteRoot(root) {
  const checkout = realpathSync(root)
  const pkg = JSON.parse(readFileSync(typographySource(checkout, 'package.json'), 'utf8'))
  if (pkg.name !== 'roomchang-foundation') throw new Error('Expected the Roomchang website checkout.')
  return checkout
}

export function writeTypographyEvidence(root, filename, evidence) {
  if (!/^[a-zA-Z0-9][a-zA-Z0-9._-]*\.json$/.test(filename)) {
    throw new Error('Evidence must be a simple JSON filename, not a path.')
  }
  let directory = realpathSync(root)
  for (const name of ['.artifacts', 'typography']) {
    const next = join(directory, name)
    try { mkdirSync(next, { mode: 0o700 }) } catch (error) {
      if (error.code !== 'EEXIST') throw error
    }
    if (realpathSync(next) !== next || !statSync(next).isDirectory()) {
      throw new Error('Evidence directory must remain inside the checkout without symlinks.')
    }
    directory = next
  }
  const destination = join(directory, filename)
  writeFileSync(destination, `${JSON.stringify(evidence, null, 2)}\n`, { flag: 'wx', mode: 0o600 })
  return destination
}

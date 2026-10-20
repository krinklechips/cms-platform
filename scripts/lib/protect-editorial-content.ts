type WriteContext = {
  argv?: readonly string[]
  databaseUri?: string
  nodeEnv?: string
}

/** Legacy rebuilds are retired on shared databases once staff edit in the CMS. */
export function assertLegacyContentWritesAllowed(tool: string, context: WriteContext = {}): void {
  const argv = context.argv ?? process.argv.slice(2)
  const databaseUri = context.databaseUri ?? process.env.DATABASE_URI
  const nodeEnv = context.nodeEnv ?? process.env.NODE_ENV
  if (
    argv.includes('--allow-local-content-overwrite') &&
    databaseUri?.startsWith('file:') &&
    nodeEnv !== 'production'
  ) return

  throw new Error(
    `CMS_CONTENT_WRITE_BLOCKED: ${tool} can replace or delete staff edits. ` +
    'Legacy content writes are disabled on shared CMS databases. Use the CMS editor or a reviewed per-document migration. ' +
    'Disposable local SQLite fixtures only: set an explicit file: DATABASE_URI and pass --allow-local-content-overwrite outside production.',
  )
}

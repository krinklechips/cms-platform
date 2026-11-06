export function refreshFixtureConnection(value) {
  const parsed = new URL(value)
  if (!['postgres:', 'postgresql:'].includes(parsed.protocol) || !['127.0.0.1', 'localhost'].includes(parsed.hostname)
    || parsed.port !== '55439' || parsed.pathname !== '/cms_refresh_fixture' || parsed.search || parsed.hash || parsed.password) {
    throw new Error('Only the password-free loopback cms_refresh_fixture on port 55439 is permitted.')
  }
  return { host: '127.0.0.1', port: 55439, database: 'cms_refresh_fixture', user: decodeURIComponent(parsed.username) || undefined }
}

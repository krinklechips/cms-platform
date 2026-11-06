import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { test } from 'node:test'

test('Docker uses the pinned Node and npm lockfile, explicitly applies patches and execs the server', () => {
  const docker = readFileSync(new URL('../Dockerfile', import.meta.url), 'utf8')
  const version = readFileSync(new URL('../.node-version', import.meta.url), 'utf8').trim()
  assert.ok(docker.includes(`FROM node:${version}-alpine AS base`))
  assert.match(docker, /COPY patches \.\/patches/)
  assert.match(docker, /npm ci --ignore-scripts/)
  assert.match(docker, /npm run postinstall/)
  assert.doesNotMatch(docker, /yarn --frozen-lockfile|pnpm i --frozen-lockfile/)
  const cmd = docker.split('\n').find(line => line.startsWith('CMD '))!
  assert.deepEqual(JSON.parse(cmd.slice(4)), ['node', 'server.js'])
})

test('Docker context excludes local credentials, dependencies and editorial files', () => {
  const ignored = readFileSync(new URL('../.dockerignore', import.meta.url), 'utf8').split('\n')
  for (const entry of ['.env', '.env.*', 'node_modules', '.next', '.git', '*.db', 'media', '.artifacts']) {
    assert.ok(ignored.includes(entry), `${entry} must not be copied into the image context`)
  }
})

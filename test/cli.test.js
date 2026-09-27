import assert from 'node:assert/strict'
import { execFile } from 'node:child_process'
import { promisify } from 'node:util'
import { test } from 'node:test'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const execFileAsync = promisify(execFile)
const dirname = path.dirname(fileURLToPath(import.meta.url))
const cli = path.join(dirname, '..', 'build', 'index.js')

const run = (...args) => execFileAsync(process.execPath, [cli, ...args], {
  env: { ...process.env, FORCE_COLOR: '0', NO_COLOR: '1' },
})

test('prints the package version', async () => {
  const { stdout, stderr } = await run('--version')
  assert.equal(stdout, '1.1.2\n')
  assert.equal(stderr, '')
})

test('prints help for all existing commands', async () => {
  const { stdout } = await run('--help')
  assert.match(stdout, /human\|hu \[options\]/)
  assert.match(stdout, /tldr\|tl <target>/)
  assert.match(stdout, /echo\|e \[options\] <target>/)
})

test('lists humans in a group', async () => {
  const { stdout } = await run('human', '--gotei13')
  assert.match(stdout, /^浦原喜助$/m)
  assert.match(stdout, /^山本元柳斎重國$/m)
  assert.doesNotMatch(stdout, /^黒崎一護$/m)
})

test('prints a character summary', async () => {
  const { stdout } = await run('tldr', '黒崎一護')
  assert.match(stdout, /黒崎一護 （くろさきいちご）/)
  assert.match(stdout, /斬月 （ざんげつ）/)
  assert.match(stdout, /天鎖斬月 （てんさざんげつ）/)
})

test('prints No matching for an unknown character', async () => {
  const { stdout, stderr } = await run('tldr', '存在しない人物')
  assert.equal(stdout, 'No matching\n')
  assert.equal(stderr, '')
})

test('prints shikai output in order', async () => {
  const { stdout } = await run('echo', '--shikai', '朽木白哉')
  assert.match(stdout, /散れ[\s\S]*千本桜/)
})

test('prints bankai output in order', async () => {
  const { stdout } = await run('echo', '--bankai', '黒崎一護')
  assert.match(stdout, /卍解[\s\S]*天鎖斬月/)
})

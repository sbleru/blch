import assert from 'node:assert/strict'
import { execFile } from 'node:child_process'
import { promisify } from 'node:util'
import { test } from 'node:test'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { createRequire } from 'node:module'

const execFileAsync = promisify(execFile)
const dirname = path.dirname(fileURLToPath(import.meta.url))
const cli = path.join(dirname, '..', 'build', 'index.js')
const require = createRequire(import.meta.url)
const { version } = require('../package.json')

const run = (...args) => execFileAsync(process.execPath, [cli, ...args], {
  env: { ...process.env, FORCE_COLOR: '0', NO_COLOR: '1' },
})

test('prints the package version', async () => {
  const { stdout, stderr } = await run('--version')
  assert.equal(stdout, `${version}\n`)
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

test('echo uses Shinuchi for Ichibe while keeping Bankai for other characters', async () => {
  const ichibe = await run('echo', '--bankai', '兵主部一兵衛')
  assert.match(ichibe.stdout, /^真打\n[\s\S]*しら筆一文字/m)
  assert.doesNotMatch(ichibe.stdout, /卍解/)
  const ichigo = await run('echo', '--bankai', '黒崎一護')
  assert.match(ichigo.stdout, /^卍解\n[\s\S]*天鎖斬月/m)
  assert.doesNotMatch(ichigo.stdout, /真打/)
})

test('finds the same character by stable ID and reading', async () => {
  const byName = await run('tldr', '黒崎一護')
  for (const target of ['kurosaki-ichigo', 'くろさきいちご']) {
    const result = await run('tldr', target)
    assert.equal(result.stdout, byName.stdout)
    assert.equal(result.stderr, '')
  }
})

test('Sternritter lists affiliation history without polluting Karakura list', async () => {
  const { stdout } = await run('human', '--sternritter')
  assert.equal(stdout.trim().split('\n').length, 29)
  assert.match(stdout, /^石田雨竜$/m)
  assert.match(stdout, /^ジェイムズ$/m)
  assert.doesNotMatch(stdout, /ユーハバッハ|シャズ/)
  const karakura = await run('human', '--karakuracho')
  assert.doesNotMatch(karakura.stdout, /ハッシュヴァルト/)
})

test('Schrift prints recorded names and explicitly leaves unresolved names empty', async () => {
  const known = await run('tldr', 'jugram-haschwalth')
  assert.match(known.stdout, /B：世界調和.*ザ・バランス/)
  const unresolved = await run('tldr', 'bg9')
  assert.match(unresolved.stdout, /^    K$/m)
  assert.doesNotMatch(unresolved.stdout, /名称未入力|K：/)
  assert.doesNotMatch(unresolved.stdout, /なし\|不明/)
})

test('shared twin name returns both distinct characters', async () => {
  const { stdout } = await run('tldr', 'ロイド・ロイド')
  assert.match(stdout, /ロイド・ロイド（L）/)
  assert.match(stdout, /ロイド・ロイド（R）/)
  assert.equal((stdout.match(/Y：/g) || []).length, 2)
})

test('Wandenreich includes Sternritter and Yhwach without duplicate people', async () => {
  const empire = await run('human', '--wandenreich')
  const short = await run('hu', '-w')
  assert.equal(short.stdout, empire.stdout)
  const names = empire.stdout.trim().split('\n')
  assert.equal(names.length, 30)
  assert.equal(new Set(names).size, 30)
  assert.ok(names.includes('ユーハバッハ'))
  const knights = await run('human', '--sternritter')
  for (const name of knights.stdout.trim().split('\n')) assert.ok(names.includes(name))
  assert.doesNotMatch(knights.stdout, /ユーハバッハ/)
  const summary = await run('tldr', 'yhwach')
  assert.match(summary.stdout, /ユーハバッハ/)
  assert.match(summary.stdout, /A：全知全能/)
})

test('Vollstandig displays names and readings separately from Schrift', async () => {
  const quilge = await run('tldr', 'quilge-opie')
  assert.match(quilge.stdout, /聖文字[\s\S]*J：監獄[\s\S]*- 完聖体\n    神の正義 （ピスキエル）/)
  const robert = await run('tldr', 'robert-accutrone')
  assert.match(robert.stdout, /^    N$/m)
  assert.match(robert.stdout, /- 完聖体\n    神の歩み （グリマニエル）/)
  const deferred = await run('tldr', 'bambietta-basterbine')
  assert.doesNotMatch(deferred.stdout, /完聖体|ゾフィエル/)
})

test('lists five Zero Division members without adding them to Gotei 13', async () => {
  const list = await run('human', '--zero')
  const short = await run('hu', '-z')
  assert.equal(short.stdout, list.stdout)
  assert.equal(list.stdout.trim().split('\n').length, 5)
  for (const name of ['兵主部一兵衛', '二枚屋王悦', '麒麟寺天示郎', '修多羅千手丸', '曳舟桐生']) assert.ok(list.stdout.includes(name))
  const gotei = await run('hu', '-g')
  assert.doesNotMatch(gotei.stdout, /兵主部|二枚屋|麒麟寺|修多羅|曳舟/)
})

test('Zero Division names, readings and IDs show only adopted manga abilities', async () => {
  const ichibe = await run('tldr', '兵主部一兵衛')
  assert.equal((await run('tldr', 'ひょうすべいちべえ')).stdout, ichibe.stdout)
  assert.equal((await run('tldr', 'hyosube-ichibe')).stdout, ichibe.stdout)
  assert.match(ichibe.stdout, /- 真打\n    しら筆一文字 （しらふでいちもんじ）/)
  assert.doesNotMatch(ichibe.stdout, /- 卍解|千里通天掌|不転太殺陵/)
  const oetsu = await run('tldr', '二枚屋王悦')
  assert.match(oetsu.stdout, /鞘伏 （さやふし）/)
  assert.doesNotMatch(oetsu.stdout, /解号|卍解|なし\|不明/)
  const kirinji = await run('tldr', '麒麟寺天示郎')
  assert.match(kirinji.stdout, /天照一閃 （てんしょういっせん）/)
  assert.match(kirinji.stdout, /金毘迦 （きんぴか）/)
  const senjumaru = await run('tldr', '修多羅千手丸')
  assert.doesNotMatch(senjumaru.stdout, /刺絡|娑闥|卍解|なし\|不明/)
})

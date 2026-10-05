import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import { test } from 'node:test'
import { getCharacterDataList } from '../build/lib/files.js'
import { toLegacyHuman } from './fixtures/legacy-projection.js'
import { assertCharacterDataset } from '../build/lib/validate.js'
import { findCharacter, findCharactersByGroup } from '../build/lib/search.js'
import * as current from '../build/lib/output.js'
import * as previous from './fixtures/legacy-output.js'

const dataset = JSON.parse(await readFile(new URL('../data/characters.json', import.meta.url), 'utf8'))
const original = JSON.parse(await readFile(new URL('./fixtures/humans.legacy.json', import.meta.url), 'utf8'))
const characters = await getCharacterDataList()

function capture(action) {
  const output = []; const log = console.log; const timeout = globalThis.setTimeout
  console.log = (...args) => output.push(args.join(' '))
  globalThis.setTimeout = callback => { callback(); return 0 }
  try { action() } finally { console.log = log; globalThis.setTimeout = timeout }
  return output
}

test('all 73 characters retain every one of the 18 original CSV columns', () => {
  assert.equal(characters.length, 73)
  assert.deepEqual(characters.map(toLegacyHuman), original)
})

test('all migrated summaries and echoes match the independent legacy renderer', () => {
  for (const [index, character] of characters.entries()) {
    for (const name of ['outputTldr', 'echoShikai', 'echoBankai']) {
      assert.deepEqual(capture(() => current[name](character)), capture(() => previous[name](original[index])), `${character.id}: ${name}`)
    }
  }
})

test('all group lists and division filters retain their original membership and order', () => {
  for (const group of ['all', 'gotei13', 'espada', 'visored', 'karakuracho', 'fullbringer']) {
    for (const options of [null, ['6'], ['103']]) {
      assert.deepEqual(findCharactersByGroup(characters, group, options).map(c => c.name.text), previous.findHumansByGroupCode(original, group, options).map(h => h.name))
    }
  }
})

test('search supports names, readings, aliases and stable IDs', () => {
  const ichigo = characters.find(c => c.id === 'kurosaki-ichigo')
  for (const target of ['kurosaki-ichigo', '黒崎一護', 'くろさきいちご']) assert.equal(findCharacter(characters, target), ichigo)
  const withAlias = structuredClone(ichigo)
  withAlias.aliases = [{ text: 'test-alias', reading: { status: 'unrecorded' } }]
  assert.equal(findCharacter([withAlias], 'test-alias'), withAlias)
  assert.equal(findCharacter(characters, 'missing'), undefined)
})

test('migration adds no outside sources, chronology, memberships, or inferred second systems', () => {
  for (const c of characters) {
    assert.equal(c.memberships.length, 1)
    assert.equal(c.abilities.length, 1)
    assert.equal(c.abilities[0].kind, c.legacyView.tldrType)
    assert.equal(c.sources.length, 1)
    assert.equal(c.sources[0].kind, 'legacyCsv')
    assert.equal(c.sources[0].reviewStatus, 'needsReview')
    for (const record of [...c.memberships, ...c.abilities[0].items]) {
      assert.equal(record.timeline.summaryStatus, 'unrecorded')
      assert.equal(record.timeline.referencePoint.status, 'unrecorded')
      assert.deepEqual(record.timeline.supersedes, [])
    }
  }
})

test('third and later array entries are displayed without a second-slot limit', () => {
  const renji = structuredClone(characters.find(c => c.id === 'abarai-renji'))
  const item = structuredClone(renji.abilities[0].items.find(i => i.kind === 'bankai'))
  item.id = 'test-bankai-third'; item.name.text = 'test extra'; item.legacySlot = null
  renji.abilities[0].items.push(item)
  assert.ok(capture(() => current.outputTldr(renji)).some(line => line.includes('test extra')))
})

test('invalid version, duplicate IDs, malformed values and broken references fail validation', () => {
  const mutations = [
    d => { d.schemaVersion = 2 },
    d => { d.characters[1].id = d.characters[0].id },
    d => { d.characters[0].name.text = '' },
    d => { d.characters[0].name.reading = { status: 'known', value: 1 } },
    d => { d.characters[0].memberships[0].groupId = 'all' },
    d => { d.characters[0].memberships[0].sourceIndex = 99 },
    d => { d.characters[0].abilities[0].items[0].displaySection = 'missing' },
    d => { d.characters[0].abilities[0].items[0].timeline.supersedes = ['missing-id'] },
    d => { d.characters[0].abilities[0].items[1].legacySlot = d.characters[0].abilities[0].items[0].legacySlot },
    d => { d.characters[0].memberships[0].timeline.summaryStatus = 'current' },
  ]
  for (const mutate of mutations) {
    const copy = structuredClone(dataset); mutate(copy)
    assert.throws(() => assertCharacterDataset(copy), /Invalid character data/)
  }
})

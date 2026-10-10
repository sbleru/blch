import type { CharacterDataset } from '../types/characters.js'

type ObjectValue = Record<string, unknown>
function fail(path: string): never { throw new Error(`Invalid character data: ${path}`) }
function object(value: unknown, path: string): ObjectValue {
  if (!value || typeof value !== 'object' || Array.isArray(value)) fail(path)
  return value as ObjectValue
}
function array(value: unknown, path: string): unknown[] { if (!Array.isArray(value)) fail(path); return value }
function text(value: unknown, path: string, empty = false): void {
  if (typeof value !== 'string' || (!empty && !value.trim())) fail(path)
}
function choice(value: unknown, options: readonly string[], path: string): void {
  if (typeof value !== 'string' || !options.includes(value)) fail(path)
}
function integer(value: unknown, path: string, minimum = 1): void {
  if (!Number.isInteger(value) || Number(value) < minimum) fail(path)
}
function knowledge(value: unknown, path: string, check: (value: unknown, path: string) => void): void {
  const entry = object(value, path)
  choice(entry.status, ['known', 'unrecorded', 'unknown', 'none'], path)
  if (entry.status === 'known') check(entry.value, `${path}.value`)
  else if ('value' in entry) fail(`${path}.value`)
}
function named(value: unknown, path: string): void {
  const entry = object(value, path); text(entry.text, `${path}.text`)
  knowledge(entry.reading, `${path}.reading`, text)
}
function citation(value: unknown, path: string): void {
  if (value === null) return
  const entry = object(value, path); text(entry.label, `${path}.label`)
  for (const key of ['volumeNumber', 'chapterNumber', 'pageNumber']) if (entry[key] !== null) integer(entry[key], `${path}.${key}`)
}
const groups = ['gotei13', 'espada', 'visored', 'karakuracho', 'fullbringer', 'sternritter', 'wandenreich', 'arrancar']
const legacyGroups = groups.slice(0, 7)
const systems = ['shinigami', 'hollow', 'fullbringer', 'quincy']
const slots = ['kaigou', 'zanpakuto', 'bankai', 'kaigou2', 'zanpakuto2', 'bankai2']
const itemKinds = ['releaseCommand', 'weapon', 'bankai', 'resurreccion', 'fullbring', 'technique', 'quincyAbility', 'unclassified']
function storyPoint(value: unknown, path: string): void {
  const entry = object(value, path); text(entry.label, `${path}.label`)
  choice(entry.continuity, ['manga', 'anime', 'unrecorded'], `${path}.continuity`)
  if (entry.chapterNumber !== null) integer(entry.chapterNumber, `${path}.chapterNumber`)
}
function reference(value: unknown, sourceCount: number, path: string): void {
  integer(value, path, 0); if (Number(value) >= sourceCount) fail(path)
}

export function assertCharacterDataset(value: unknown): asserts value is CharacterDataset {
  const root = object(value, 'root'); if (root.schemaVersion !== 1 && root.schemaVersion !== 2) fail('schemaVersion')
  const ids = new Set<string>()
  const unique = (value: unknown, path: string, seen: Set<string>) => {
    text(value, path); if (!/^[a-z][a-z0-9-]*$/.test(String(value)) || seen.has(String(value))) fail(path)
    seen.add(String(value))
  }
  for (const [index, raw] of array(root.characters, 'characters').entries()) {
    const path = `characters[${index}]`; const character = object(raw, path)
    unique(character.id, `${path}.id`, ids); named(character.name, `${path}.name`)
    for (const alias of array(character.aliases, `${path}.aliases`)) named(alias, `${path}.aliases`)
    text(character.description, `${path}.description`, true)
    const sources = array(character.sources, `${path}.sources`)
    if (!sources.length) fail(`${path}.sources`)
    for (const source of sources) {
      const s = object(source, `${path}.sources`)
      choice(s.kind, ['legacyCsv', 'repository', 'manga', 'officialWebsite', 'communityWebsite'], `${path}.source.kind`)
      text(s.locator, `${path}.source.locator`)
      if (s.revision !== null) text(s.revision, `${path}.source.revision`)
      citation(s.citation, `${path}.source.citation`)
      choice(s.reviewStatus, ['needsReview', 'verified'], `${path}.source.reviewStatus`)
      for (const note of array(s.notes, `${path}.source.notes`)) text(note, `${path}.source.note`)
    }
    const view = object(character.legacyView, `${path}.legacyView`)
    choice(view.groupId, legacyGroups, `${path}.legacyView.groupId`)
    text(view.attribute, `${path}.legacyView.attribute`, true)
    choice(view.tldrType, systems, `${path}.legacyView.tldrType`)
    const recordIds = new Set<string>(); const timedRecords: ObjectValue[] = []
    for (const rawMembership of array(character.memberships, `${path}.memberships`)) {
      const membership = object(rawMembership, `${path}.memberships`)
      unique(membership.id, `${path}.membership.id`, recordIds)
      choice(membership.groupId, groups, `${path}.membership.groupId`)
      knowledge(membership.divisionNumber, `${path}.membership.divisionNumber`, integer)
      knowledge(membership.designation, `${path}.membership.designation`, text)
      knowledge(membership.role, `${path}.membership.role`, text)
      reference(membership.sourceIndex, sources.length, `${path}.membership.sourceIndex`)
      timedRecords.push(membership)
    }
    const assigned = new Set<string>()
    for (const rawSystem of array(character.abilities, `${path}.abilities`)) {
      const system = object(rawSystem, `${path}.abilities`)
      unique(system.id, `${path}.system.id`, recordIds)
      choice(system.kind, systems, `${path}.system.kind`)
      if (system.kind === 'quincy') {
        knowledge(system.schrift, `${path}.schrift`, (value, path) => {
          const s = object(value, path); text(s.letter, `${path}.letter`); if (s.name !== null) named(s.name, `${path}.name`); else if (root.schemaVersion === 1) fail(`${path}.name`)
        })
        knowledge(system.vollstandig, `${path}.vollstandig`, (value, path) => {
          for (const name of array(value, path)) named(name, path)
        })
      }
      for (const rawItem of array(system.items, `${path}.system.items`)) {
        const item = object(rawItem, `${path}.item`)
        unique(item.id, `${path}.item.id`, recordIds); named(item.name, `${path}.item.name`)
        choice(item.kind, itemKinds, `${path}.item.kind`)
        choice(item.displaySection, ['first', 'second', 'third'], `${path}.item.displaySection`)
        reference(item.sourceIndex, sources.length, `${path}.item.sourceIndex`)
        if (item.legacySlot !== null) {
          choice(item.legacySlot, slots, `${path}.item.legacySlot`)
          if (assigned.has(String(item.legacySlot))) fail(`${path}.item.legacySlot (duplicate)`)
          assigned.add(String(item.legacySlot))
        }
        timedRecords.push(item)
      }
    }
    for (const record of timedRecords) {
      const timeline = object(record.timeline, `${path}.timeline`)
      choice(timeline.summaryStatus, ['current', 'past', 'unrecorded'], `${path}.timeline.summaryStatus`)
      choice(timeline.reviewStatus, ['needsReview', 'verified'], `${path}.timeline.reviewStatus`)
      for (const key of ['referencePoint', 'validFrom', 'validUntil']) knowledge(timeline[key], `${path}.timeline.${key}`, storyPoint)
      if (timeline.sourceIndex !== null) reference(timeline.sourceIndex, sources.length, `${path}.timeline.sourceIndex`)
      if (timeline.summaryStatus !== 'unrecorded' && (object(timeline.referencePoint, path).status !== 'known' || timeline.sourceIndex === null)) fail(`${path}.timeline (missing basis)`)
      for (const previous of array(timeline.supersedes, `${path}.timeline.supersedes`)) {
        text(previous, path)
        if (previous === record.id || !timedRecords.some(r => r.id === previous)) fail(`${path}.timeline.supersedes`)
      }
    }
  }
}

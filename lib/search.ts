import type { Character } from '../types/characters.js'
import type { GroupCode } from '../types/index.js'

export function findCharacters(data: readonly Character[], target: string): Character[] {
  return data.filter(character => character.id === target || character.name.text === target ||
    (character.name.reading.status === 'known' && character.name.reading.value === target) ||
    character.aliases.some(alias => alias.text === target || (alias.reading.status === 'known' && alias.reading.value === target)))
}

/** Preserve the CSV's list membership while chronological affiliation remains unreviewed. */
export function findCharactersByGroup(data: readonly Character[], groupCode: GroupCode, options: string[] | null = null): Character[] {
  return data.filter(character => groupCode === 'all' ||
    (groupCode === 'sternritter' && character.memberships.some(m => m.groupId === 'sternritter')) ||
    (groupCode === 'wandenreich' && character.memberships.some(m => m.groupId === 'wandenreich' || m.groupId === 'sternritter')) ||
    (character.legacyView.groupId === groupCode && (!options || character.legacyView.attribute === options[0])))
}

export function findCharacter(data: readonly Character[], target: string): Character | undefined {
  return findCharacters(data, target)[0]
}

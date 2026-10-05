import { readFile } from 'node:fs/promises'
import type { Character, CharacterDataset } from '../types/characters.js'
import { assertCharacterDataset } from './validate.js'

export const getCharacterDataList = async (): Promise<Character[]> => {
  const value: unknown = JSON.parse(await readFile(new URL('../data/characters.json', import.meta.url), 'utf8'))
  assertCharacterDataset(value)
  return (value as CharacterDataset).characters
}

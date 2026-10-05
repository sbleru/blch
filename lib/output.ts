import chalk from 'chalk'
import type { Character, AbilityItem, NamedText } from '../types/characters.js'
import type { TldrType } from '../types/index.js'

const reading = (name: NamedText): string => name.reading.status === 'known' ? name.reading.value : ''
const entries = (character: Character): AbilityItem[] => character.abilities.flatMap(system => system.items)

/** Display every entry, preserving the CSV's empty first-slot placeholder. */
const sectionNames = (character: Character, section: AbilityItem['displaySection']): string[] => {
  const items = entries(character).filter(item => item.displaySection === section)
  const names = items.map(item => getNameWithKana(item.name.text, reading(item.name)))
  const primarySlot = { first: 'kaigou', second: 'zanpakuto', third: 'bankai' }[section]
  if (!items.length || (items.every(item => item.legacySlot !== primarySlot) && items.some(item => item.legacySlot === `${primarySlot}2`))) {
    names.unshift('なし|不明')
  }
  return names
}

export const outputTldr = (character: Character) => {
  const type = character.legacyView.tldrType
  const sections: [AbilityItem['displaySection'], string | null][] = [
    ['first', getFirstItemGenericName(type)],
    ['second', getSecondItemGenericName(type)],
    ['third', getThirdItemGenericName(type)],
  ]
  console.log()
  console.log(chalk.bold(getNameWithKana(character.name.text, reading(character.name))))
  if (character.description) console.log('\n' + chalk.reset(character.description))
  for (const [section, label] of sections) {
    if (!label) continue
    console.log(chalk.green(`\n- ${label}`))
    for (const name of sectionNames(character, section)) console.log(chalk.cyanBright(`    ${name}`))
  }
  console.log()
}

const getNameWithKana = (name: string, nameKana: string) => {
  if (!name) {
    return null
  }
  return `${name} ${nameKana ? `（${nameKana}）` : ''}`
}

const getFirstItemGenericName = (tldrType: TldrType) => {
  if (tldrType === 'fullbringer') {
    return '完現術'
  }
  if (tldrType === 'quincy') {
    return '能力'
  }
  return '解号'
}

const getSecondItemGenericName = (tldrType: TldrType) => {
  if (tldrType === 'fullbringer') {
    return '技'
  }
  if (tldrType === 'hollow') {
    return '帰刃'
  }
  if (tldrType === 'quincy') {
    return null
  }
  return '斬魄刀'
}

const getThirdItemGenericName = (tldrType: TldrType) => {
  if (tldrType === 'shinigami') {
    return '卍解'
  }
  return null
}

/** Preserve existing echo behavior: the original first entries are spoken. */
const echoEntry = (character: Character, slot: string): string =>
  entries(character).find(item => item.legacySlot === slot)?.name.text || ''

export const echoShikai = (character: Character) => {
  const command = echoEntry(character, 'kaigou')
  const weapon = echoEntry(character, 'zanpakuto')
  if (!command && !weapon) return
  if (command) {
    console.log()
    console.log(chalk.bold(command))
    console.log()
  }
  setTimeout(() => {
    console.log(chalk.cyanBright.bold(weapon))
    console.log()
  }, 1000)
}

export const echoBankai = (character: Character) => {
  const bankai = echoEntry(character, 'bankai')
  if (!bankai) return
  console.log()
  console.log(chalk.bold('卍解'))
  console.log()
  setTimeout(() => {
    console.log(chalk.redBright.bold(bankai))
    console.log()
  }, 1000)
}

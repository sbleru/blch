import * as chalk from 'chalk';
import { Human, GroupCode } from "../types";

/**
 * make look it better and output tldr
 * @param human 
 */
export const outputTldr = (human: Human) => {

  const weaponGenericName = getWeaponGenericName(human.groupCode)

  const humanName = getNameWithKana(human.name, human.nameKana)
  const kaigouName = getNameWithKana(human.kaigou, human.kaigouKana) || '不明'
  const kaigou2Name = getNameWithKana(human.kaigou2, human.kaigou2Kana)
  const zanpakutoName = getNameWithKana(human.zanpakuto, human.zanpakutoKana) || '不明'
  const zanpakuto2Name = getNameWithKana(human.zanpakuto2, human.zanpakuto2Kana)
  const bankaiName = getNameWithKana(human.bankai, human.bankaiKana) || '不明'
  const bankai2Name = getNameWithKana(human.bankai2, human.bankai2Kana)

  console.log()
  console.log(chalk.bold(humanName))
  console.log(chalk.green('\n- 解号'))
  console.log(chalk.cyanBright(`    ${kaigouName}`))
  kaigou2Name ? console.log(chalk.cyanBright(`    ${kaigou2Name}`)) : ''
  console.log(chalk.green(`\n- ${weaponGenericName}`))
  console.log(chalk.cyanBright(`    ${zanpakutoName}`))
  zanpakuto2Name ? console.log(chalk.cyanBright(`    ${zanpakuto2Name}`)) : ''
  if (human.groupCode !== 'espada') {
    console.log(chalk.green('\n- 卍解'))
    console.log(chalk.cyanBright(`    ${bankaiName}`))
    bankai2Name ? console.log(chalk.cyanBright(`    ${bankai2Name}`)) : ''
  }
  console.log()
}

const getNameWithKana = (name: string, nameKana: string) => {
  if (!name) {
    return null
  }
  return `${name} ${nameKana ? `（${nameKana}）` : ''}`
}

const getWeaponGenericName = (groupCode: GroupCode) => {
  return groupCode === 'espada'
    ? '帰刃'
    : '斬魄刀'
}

/**
 * filter humans by group code and option
 * @param dataList 
 * @param groupCode 
 * @param options 
 */
export const findHumansByGroupCode = (dataList: Human[], groupCode: GroupCode, options: string[] = null) => {
  if (groupCode === 'all') {
    return dataList
  }
  const humans = dataList.filter(el => {
    if (!options) {
      return el.groupCode === groupCode
    }
    const targetNumber = options[0]
    return el.groupCode === groupCode && el.attribute1 === targetNumber
  })
  return humans
}

/**
 * echo shikai
 * @param human 
 */
export const echoShikai = (human: Human) => {
  if (!human.kaigou && !human.zanpakuto) {
    // No matching
    return
  }
  if (human.kaigou) {
    console.log()
    console.log(chalk.bold(human.kaigou))
    console.log()
  }
  setTimeout(() => {
    console.log(chalk.cyanBright.bold(human.zanpakuto))
    console.log()
  }, 1000)
}

/**
 * echo bankai
 * @param human 
 */
export const echoBankai = (human: Human) => {
  if (!human.bankai) {
    // No matching
    return
  }
  console.log()
  console.log(chalk.bold('卍解'))
  console.log()
  setTimeout(() => {
    console.log(chalk.redBright.bold(human.bankai))
    console.log()
  }, 1000)
}
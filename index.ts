#!/usr/bin/env node

import * as files from './lib/files.js';
import { findCharacter, findCharactersByGroup } from './lib/search.js';
import { program } from 'commander';
import { createRequire } from 'node:module';
import { GroupCode } from "./types/index.js";
import { outputTldr, echoShikai, echoBankai } from "./lib/output.js";

const require = createRequire(import.meta.url)
const { version } = require('../package.json') as { version: string }

// バージョン情報
program
  .version(version, '-V, --version')

program
  .command('human')
  .alias('hu')
  .description('Output human names')
  .option("-a, --all", "List all")
  .option("-g, --gotei13", "List gotei 13")
  .option("-e, --espada", "List espada")
  .option("-v, --visored", "List visored")
  .option("-k, --karakuracho", "List karakuracho")
  .option("-f, --fullbringer", "List fullbringer")
  .action( async (options) => {

    const dataList = await files.getCharacterDataList()

    let targetCode: GroupCode = 'all'
    if (options.gotei13) {
      targetCode = 'gotei13'
    }
    if (options.espada) {
      targetCode = 'espada'
    }
    if (options.visored) {
      targetCode = 'visored'
    }
    if (options.karakuracho) {
      targetCode = 'karakuracho'
    }
    if (options.fullbringer) {
      targetCode = 'fullbringer'
    }
    const humans = findCharactersByGroup(dataList, targetCode)
    if (humans.length === 0) {
      console.log('No matching')
      return
    }
    humans.forEach(human => console.log(human.name.text))

  })
  .on('--help', function() {
    console.log('\n  Examples:')
    console.log()
    console.log('    $ blch human --gotei13')
    console.log('    $ blch hu -g')
    console.log()
  })

program
  .command('tldr <target>')
  .alias('tl')
  .description('Output character tldr')
  .action( async (target, options) => {

    const dataList = await files.getCharacterDataList()
    const human = findCharacter(dataList, target)
    if (!human) {
      console.log('No matching')
      return
    }
    outputTldr(human)

  }).on('--help', function() {
    console.log('\n  Examples:')
    console.log()
    console.log('    $ blch tldr 黒崎一護')
    console.log()
  })

program
  .command('echo <target>')
  .alias('e')
  .option("-s, --shikai", "echo shikai")
  .option("-b, --bankai", "echo bankai")
  .description('echo shikai, bankai')
  .action( async (target, options) => {

    const dataList = await files.getCharacterDataList()
    const human = findCharacter(dataList, target)
    if (!human) {
      console.log('No matching')
      return
    }
    if (options.shikai) {
      echoShikai(human)
    } else if (options.bankai) {
      echoBankai(human)
    }

  }).on('--help', function() {
    console.log('\n  Examples:')
    console.log()
    console.log('    $ blch echo --shikai 朽木白哉')
    console.log('    $ blch echo --bankai 黒崎一護')
    console.log()
  })

program.parse(process.argv)

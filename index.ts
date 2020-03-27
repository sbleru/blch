#!/usr/bin/env node

import * as files from './lib/files';
import * as program from 'commander';
import { Human, GroupCode } from "./types";
import { outputTldr, findHumansByGroupCode, echoShikai, echoBankai } from "./lib/output";

// バージョン情報
program
  .version('0.0.1', '-V, --version')

program
  .command('human')
  .alias('hu')
  .description('Output human names')
  .option("-a, --all", "List all")
  .option("-g, --gotei13", "List gotei 13")
  .option("-e, --espada", "List espada")
  .option("-v, --visored", "List visored")
  .option("-o, --karakuracho", "List karakuracho")
  .option("-f, --fullbringer", "List fullbringer")
  .action( async (cmd, options) => {

    const dataList: Human[] = await files.getHumanDataList()

    let targetCode: GroupCode = 'all'
    if (cmd.gotei13) {
      targetCode = 'gotei13'
    }
    if (cmd.espada) {
      targetCode = 'espada'
    }
    if (cmd.visored) {
      targetCode = 'visored'
    }
    if (cmd.karakuracho) {
      targetCode = 'karakuracho'
    }
    if (cmd.fullbringer) {
      targetCode = 'fullbringer'
    }
    const humans = findHumansByGroupCode(dataList, targetCode, options)
    if (humans.length === 0) {
      console.log('No matching')
      return
    }
    humans.forEach(human => console.log(human.name))

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

    const dataList: Human[] = await files.getHumanDataList()
    const humans = dataList.filter(el => el.name == target)
    if (humans.length === 0) {
      console.log('No matching')
      return
    }
    outputTldr(humans[0])

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

    const dataList: Human[] = await files.getHumanDataList()
    const humans = dataList.filter(el => el.name == target)
    if (humans.length === 0) {
      console.log('No matching')
      return
    }
    if (options.shikai) {
      echoShikai(humans[0])
    } else if (options.bankai) {
      echoBankai(humans[0])
    }

  }).on('--help', function() {
    console.log('\n  Examples:')
    console.log()
    console.log('    $ blch echo --shikai 朽木白哉')
    console.log('    $ blch echo --bankai 黒崎一護')
    console.log()
  })

program.parse(process.argv)
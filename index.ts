#!/usr/bin/env node

import * as files from './lib/files';
import * as program from 'commander';
import * as fs from 'fs';
import * as chalk from 'chalk';
import * as marked from 'marked';
import * as TerminalRenderer from 'marked-terminal';
 
marked.setOptions({
  // Define custom renderer
  // ref: https://www.npmjs.com/package/marked-terminal
  renderer: new TerminalRenderer({
    firstHeading: chalk.bold.white.underline,
    paragraph: chalk.reset.bold,
    codespan: chalk.cyan,
  })
});

// バージョン情報
program
  .version('0.0.1', '-v, --version')

program
  .command('human')
  .alias('hu')
  .description('Output human names')
  .option("-a, --all", "List all")
  .option("-g, --gotei13", "List gotei 13")
  .option("-e, --espada", "List espada")
  .option("-vi, --visored", "List visored")
  .option("-o, --other", "List other")
  .action((cmd, options) => {
    let names: string[] = []
    if (cmd.gotei13) {
      names = files.getFileNames(null, 'gotei13')
    }
    if (cmd.espada) {
      names = files.getFileNames(null, 'espada')
    }
    if (cmd.visored) {
      names = files.getFileNames(null, 'visored')
    }
    if (cmd.other) {
      names = files.getFileNames(null, 'other')
    }
    if (cmd.all || names.length === 0) {
      names = files.getFileNames()
    }
    // output names
    console.log(names.join('\n'))
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
  // .option("-en, --english", "Translate to English") // WANT
  .action((target, options) => {
    const path = files.getFilePath(null, target)
    const text = fs.readFileSync(path, {encoding: 'utf8'});
    // output tldr
    console.log('\n' + marked(text))
  }).on('--help', function() {
    console.log('\n  Examples:')
    console.log()
    console.log('    $ blch tldr 黒崎一護')
    console.log()
  })

program.parse(process.argv)
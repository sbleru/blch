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
  .description('output human name')
  .option("-a, --all", "list all")
  .option("-g, --gotei13", "list gotei 13")
  .option("-e, --espada", "list espada")
  .option("-vi, --visored", "list visored")
  .option("-o, --other", "list other")
  .action((cmd, options) => {
    let names
    if (cmd.all) {
      names = files.getFileNames()
    }
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
    console.log(names.join('\n'))
  })
  .on('--help', function() {
    console.log('  Examples:')
    console.log()
    console.log('    $ deploy exec sequential')
    console.log('    $ deploy exec async')
    console.log()
  })

program
  .command('tldr <target>')
  .alias('tl')
  .description('output tldr')
  .option("-t, -list_target <target>", "Which target to output")
  .action((target, options) => {
    // tldrコマンドみたいに綺麗に表示させたい
    const path = files.getFilePath(null, target)
    const text = fs.readFileSync(path, {encoding: 'utf8'});
    console.log('\n' + marked(text))
  }).on('--help', function() {
    console.log('  Examples:')
    console.log()
    console.log('    $ deploy exec sequential')
    console.log('    $ deploy exec async')
    console.log()
  })

program.parse(process.argv)
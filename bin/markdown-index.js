#!/usr/bin/env node
'use strict';

var yargs = require('yargs'),
  Promise = require('bluebird'),
  markdownIndex = require('../index');

var argv = yargs
    .option('inject', {
      alias: 'i',
      describe: 'Do not output to STDOUT; instead, inject TOC into file at ' +
      'range marked by <!-- TOC -->...<!-- /TOC -->".  Mutually exclusive ' +
      'with "--output"'
    })
    .option('exclude', {
      alias: 'x',
      describe: 'Exclude a glob.  Injected file (if any) and node_modules/ ' +
      'are excluded by default'
    })
    .option('output', {
      alias: 'o',
      describe: 'Do not write to SDTOUT; instead, write to file.  Mutually ' +
      'exclusive with "--inject"'
    })
    .strict()
    .usage('Writes a TOC for a directory fulla Markdown files to STDOUT.\n\n' +
    'Usage: markdown-index [options] [directory]')
    .help('help')
    .alias('help', 'h')
    .version(function getVersion() {
      return require(require('path').join(__dirname, '..', 'package.json'))
        .version;
    })
    .alias('version', 'v')
    .check(function checkArgs(argv) {
      if (argv.inject && argv.output) {
        throw new Error('--inject and --output cannot be used together');
      }
      return true;
    })
    .argv,

  dir = argv._[0] || process.cwd();

markdownIndex(dir, argv.exclude || argv.inject)
  .then(function (data) {
    if (argv.inject) {
      return markdownIndex.inject(argv.inject, data);
    }

    if (argv.output) {
      return Promise.promisify(require('fs').writeFile)(argv.output, data);
    }

    process.stdout.write(data);
  })
  .catch(function (err) {
    if (err instanceof Error) {
      throw err;
    }
    throw new Error(err);
  });

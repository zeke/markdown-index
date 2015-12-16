#!/usr/bin/env node

const fs = require('fs')
const path = require('path')
const glob = require('glob')
const toc = require('marked-toc')
const inflection = require('inflection')
const dir = process.argv[2]

if (!dir) {
  console.log('\nUsage: \nmarkdown-index directory/fulla/markdowns\n')
  process.exit(1)
}

glob(dir + '/**/*.md', function (err, files) {
  if (err) throw err
  var tables = files.map(function (file) {
    var table = toc(fs.readFileSync(file, 'utf8'))

    if (file.match('index.md')) return
    if (file.match('README.md')) return
    if (file.match('node_modules')) return
    if (table.length < 10) return

    var prettyFile = inflection.titleize(path.parse(file).name.replace(/(_|-)/g, ' '))

    // Add filename as a heading
    table = '### [' + prettyFile + '](' + file + ')\n\n' + table

    // Prepend filename to links
    table = table.replace(/\(#/g, '(' + file + '#')
    return table
  })

  process.stdout.write(tables.join('\n'))
  return tables.join('\n\n')
})

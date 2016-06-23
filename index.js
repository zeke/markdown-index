#!/usr/bin/env node

const fs = require('fs')
const path = require('path')
const glob = require('glob')
const toc = require('markdown-toc')
const inflection = require('inflection')
const dir = process.argv[2]

if (!dir) {
  console.log('\nUsage: \nmarkdown-index directory/fulla/markdowns\n')
  process.exit(1)
}

glob(dir + '/**/*.md', function (err, files) {
  if (err) throw err
  var tables = files.map(function (file) {
    if (file.match('index.md')) return
    if (file.match('README.md')) return
    if (file.match('node_modules')) return

    var filenameSlug = toc.slugify(path.parse(file).name)
    var originalLinkify = toc.linkify
    var table = toc(fs.readFileSync(file, 'utf8'), {
      filter: function(str, ele, arr) {
        // Skip top-level elements if their slug matches a slug of the filename.
        return ele.level != 1 || ele.slug != filenameSlug
      },
      linkify: function(tok, text, slug, opts) {
        // Use empty options arg to avoid infinite recursion.
        var tok = originalLinkify(tok, text, slug, {})
        // Prepend filename to links.
        tok.content = tok.content.replace('#', file + '#')
        return tok
      }
    })

    // Add filename as a heading.
    return '### [' + filenameSlug + '](' + file + ')\n\n' + table.content
  })

  process.stdout.write(tables.join('\n\n'))
  return tables.join('\n\n')
})


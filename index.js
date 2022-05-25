#!/usr/bin/env node

const fs = require('fs')
const path = require('path')
const glob = require('glob')
const toc = require('markdown-toc')

const dir = process.argv[2]
const index = process.argv[3]

if (!dir) {
  console.log('\nUsage: \nmarkdown-index directory/full/of/markdowns\n')
  process.exit(1)
}

glob(`${dir}/**/*.md`, (err, files) => {
  if (err) throw err
  const tables = files.map(file => {
    if (file.match('index.md')) return
    if (file.match('README.md')) return
    if (file.match('node_modules')) return

    const filenameSlug = toc.slugify(path.parse(file).name)
    const originalLinkify = toc.linkify
    const table = toc(fs.readFileSync(file, 'utf8'), {
      filter: (str, ele, arr) => ele.level !== 1 || ele.slug !== filenameSlug, // Skip top-level elements if their slug matches a slug of the filename.
      linkify: (tok, text, slug, opts) => {
        // Use empty options arg to avoid infinite recursion.
        const newTok = originalLinkify(tok, text, slug, {})
        // Prepend filename to links.
        newTok.content = newTok.content.replace('#', `${file}#`)
        return newTok
      }
    })

    // Add filename as a heading.
    return `#### [${path.parse(file).name}](${file})\n${table.content}\n`
  })

  if (index) {
    fs.writeFile(index, tables.join(''), 'utf8', err => (err ? console.log(err) : null))
  } else {
    process.stdout.write(tables.join('\n'))
  }
})

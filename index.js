#!/usr/bin/env node

var fs = require("fs")
var marked = require("marked")
var glob = require("glob")
var toc = require('marked-toc');

var dir = process.argv[2]

if (!dir) {
  console.log("\nUsage: \nmarkdown-index directory/fulla/markdowns\n")
  process.exit(1)
}

// Recursively read all markdown files
glob(dir + "/**/*.md", function (err, files) {
  // console.log(files);
  var tables = files.map(function(file) {

    // Create table of contents
    var table = toc(fs.readFileSync(file).toString(), 'utf8')

    if (file.match('index.md')) return;
    // if (file.match('README.md')) return;
    if (file.match('node_modules')) return;
    if (table.length < 10) return;

    // Add filename as a heading
    table = "### [" + file + "](" + file + ")\n\n" + table

    // Prepend filename to links
    table = table.replace(/\(#/g, "(" + file + "#")
    return table;
  })

  process.stdout.write(tables.join("\n\n"));
  return tables.join("\n\n");

})
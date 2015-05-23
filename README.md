# markdown-toc-index

Builds an index of Markdown files.

This node module is a lib and command line tool that traverses a given directory for all markdown files (with extension `.md`) and compiles all of their tables of contents into one giant markdown string. All the tables of contentses!

*This is a fork of package [markdown-index](https://www.npmjs.com/package/markdown-index).*

## Usage

### Command Line Interface

```
Writes an index for a directory fulla Markdown files to STDOUT.

Usage: toc-idx [options] [directory-or-glob]

Options:
  --inject, -i   Do not output to STDOUT; instead, inject TOC into file at
                 range marked by "<!-- INDEX -->...<!-- /INDEX -->".  Mutually
                 exclusive with "--output"
  --exclude, -x  Exclude a glob.  Injected file (if any) and node_modules/ are
                 excluded by default
  --output, -o   Do not write to SDTOUT; instead, write to file.  Mutually
                 exclusive with "--inject"
  --help, -h     Show help
  --version, -v  Show version number

Examples:
  toc-idx --inject README.md docs/       Inject an index of all *.md files
                                         within docs/ and its subdirectories
                                         into README.md
  toc-idx --output INDEX.md docs/*.md    Output the index of files matching
                                         glob docs/*.md to new file INDEX.md
```

### Programmatic

The main function can be imported programmatically:

```js
var mdTocIdx = require('markdown-toc-index');

mdTocIdx(some_directory, function(err, index) {
  // do stuff with output string "index"
});
```

In addition, an `inject()` function is available, which will work like the `--inject` option noted above:

```js
var mdTocIdx = require('markdown-toc-index');

mdTocIdx(some_directory, function(err, index) {
  mdTocIdx.inject('my-file.md', index, function(err) {
    // done
  });
});
```

## Installation

For command-line usage, you may want to install globally:

```shell
$ npm install -g markdown-toc-index
```

For programmatic usage, install locally:

```shell
$ npm install markdown-toc-index
```

## License

MIT

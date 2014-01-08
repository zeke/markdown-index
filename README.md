# markdown-index

> Build a markdown table of contents for all the markdown files in a given directory tree.

This node module is a command line tool that traverses a given directory for all markdown files (with extension `.md`) and compiles all of their tables of contents into one giant markdown string. All the tables of contentses!

## Installation

Install markdown-index globally so it's available on your path.

```
npm install -g markdown-index
```

## Usage

Give markdown-index a directory to traverse, and it outputs the indexed content to `stdout`.

```
markdown-index directory/fulla/markdowns > index.md
```

## License

MIT

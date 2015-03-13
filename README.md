# markdown-index

> Build a markdown table of contents for all the markdown files in a given directory tree.

This node module is a lib and command line tool that traverses a given directory for all markdown files (with extension `.md`) and compiles all of their tables of contents into one giant markdown string. All the tables of contentses!

## Installation

For command-line usage, you may want to install globally:

```shell
$ npm install -g markdown-index
```

For programmatic usage, install locally:

```shell
$ npm install markdown-index
```

## Usage

For command-line usage, execute:

```shell
$ markdown-index --help
```

The main function can be imported programmatically:

```js
var markdownIndex = require('markdown-index');

markdownIndex(some_directory, function(err, str) {
  // do stuff
});
```

In addition, an `inject()` function is available:



## License

MIT

// jscs:disable
'use strict';

var fs = require('fs'),
  util = require('util'),
  path = require('path'),
  globule = require('globule'),
  Promise = require('bluebird'),
  toc = require('marked-toc');

/**
 * Globs ignored by default.
 * @type {string[]}
 */
var IGNORED = ['node_modules/'],
  H3 = '###',
  H4 = '####',
  format = util.format,
  writeFile = Promise.promisify(fs.writeFile),
  readFile = Promise.promisify(fs.readFile);

/**
 * Callback for TOC
 * @callback markdownIndex.tocCallback
 * @param {(Error|string|null)} Error, if any
 * @param {string} TOC
 */

/**
 * Creates a filter function to remove any occurance of `dir` from files
 * ignored by default.
 * @see {@link IGNORED}
 * @returns {Function}
 */
var makeIgnoreFilter = function makeIgnoreFilter(dir) {
  var normalizedDir = path.normalize(dir),
    /**
     * Filter function to assert a
     * @param {string} glob Ignored glob
     * @returns {boolean} If dir matches a glob
     */
    ignoreFilter = function ignoreFilter(glob) {
      return !globule.isMatch(glob, normalizedDir);
    };
  return ignoreFilter;
};

/**
 * Return a glob into a recursive, negated glob
 * @param {string} glob Glob
 * @returns {string} recursive, negated glob
 */
var ignoreMap = function ignoreMap(glob) {
  return format('!**/%s/**', path.normalize(path.join(glob, '.')));
};

/**
 * Returns a string TOC for Markdown files found recursively in a given
 * directory.
 * `node_modules` is ignored.
 * @param {string} dir Dir to walk
 * @param {(string|Function)} [exclude] Glob to ignore or callback
 * @param {markdownIndex.tocCallback} [callback] Callback function; omit if
 * using Promises.
 * @returns {Promise.<string>} TOC
 */
var markdownIndex = function markdownIndex(dir, exclude, callback) {

  var tables, filepaths, err, globs, ignored, lastSubdir;

  if (!(dir && typeof dir === 'string')) {
    return Promise.reject(new Error('invalid parameters'))
      .nodeify(callback);
  }

  if (typeof exclude !== 'string') {
    callback = exclude;
    exclude = null;
  }

  /**
   * Filtered list of ignores that are not `dir`
   * @type {Array.<string>}
   */
  ignored = IGNORED.filter(makeIgnoreFilter(dir)).map(ignoreMap);

  // in globule, ignored files must come last
  globs = [path.join(dir, '**', '*.md')].concat(ignored);

  if (exclude) {
    globs.push(format('!%s', path.resolve(exclude)));
  }

  // Recursively read all markdown files
  filepaths = globule.find.apply(globule, globs);
  tables = filepaths.map(function (filepath) {
    var table, basename, relative, subdir, heading;

    if (err) {
      return;
    }

    // Create table of contents
    try {
      table = toc(fs.readFileSync(filepath, 'utf8'));
    } catch (e) {
      return (err = e);
    }

    basename = path.basename(filepath, '.md');
    relative = path.relative(dir, filepath);
    subdir = path.dirname(relative);

    if (subdir !== path.dirname(dir)) {
      if (subdir !== lastSubdir) {
        table = format('%s [%s](%s)\n%s', H4, basename, relative, table);
      }
      table = format('%s [%s](%s)\n%s', H3, subdir, subdir, table);
    } else {
      table = format('%s [%s](%s)\n%s', H3, basename, relative, table)
    }
    lastSubdir = subdir;

    // Prepend filename to links
    table = table.replace(/\(#/g, format('(%s#', relative));

    return table;
  });

  if (err) {
    return Promise.reject(err)
      .nodeify(callback);
  } else {
    return Promise.resolve(tables.join('\n'))
      .nodeify(callback);
  }
};

/**
 * Callback for inject
 * @callback markdownIndex.injectCallback
 * @param {(Error|string|null)} Error, if any
 * @param {*} Callback value from fs.writeFile
 */

/**
 * Inject a TOC string into file at range "<!-- TOC -->...<!-- /TOC -->"
 * @param {string} filepath File to inject TOC into
 * @param {string} toc TOC string
 * @param {Function} [callback] Optional callback.  Omit if using Promises.
 * @returns {Promise} Resolves when complete
 */
markdownIndex.inject = function inject(filepath, toc, callback) {
  if (typeof toc !== 'string' || typeof filepath !== 'string' || !filepath) {
    return Promise.reject(new Error('invalid parameters'))
      .nodeify(callback);
  }

  return readFile(filepath, 'utf8')
    .then(function (str) {
      var replaced = str
        .replace(/(<!--\s*TOC\s*-->)[\S\s]*(<!--\s*\/TOC\s*-->)/i,
        format('$1\n%s\n$2', toc));
      return writeFile(filepath, replaced);
    })
    .nodeify(callback);
};

module.exports = markdownIndex;

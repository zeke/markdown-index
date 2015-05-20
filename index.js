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
  format = util.format,
  makeIgnoreFilter, markdownIndex;

Promise.promisifyAll(fs);

/**
 * Callback for TOC
 * @callback markdownIndex.tocCallback
 * @param {(Error|string|null)} Error, if any
 * @param {string} TOC
 */

/**
 * Creates a filter function to remove any occurance of `dir` from files
 * ignored by default.
 * @param {string} dir Dirpath
 * @see {@link IGNORED}
 * @returns {Function} Filter function
 */
makeIgnoreFilter = function makeIgnoreFilter(dir) {
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
 * Returns a string TOC for Markdown files found recursively in a given
 * directory.
 * `node_modules` is ignored.
 * @param {string} dir Dir to walk
 * @param {(string|Function)} [exclude] Glob to ignore or callback
 * @param {markdownIndex.tocCallback} [callback] Callback function; omit if
 * using Promises.
 * @returns {Promise.<string>} TOC
 */
markdownIndex = function markdownIndex(dir, exclude, callback) {

  var filepaths, globs, ignored;

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
  ignored = IGNORED.filter(makeIgnoreFilter(dir));

  // in globule, ignored files must come last
  globs = [path.join(dir, '**', '*.md')].concat(ignored);

  if (exclude) {
    globs.push(format('!%s', path.resolve(exclude)));
  }

  // Recursively read all markdown files
  filepaths = globule.find.apply(globule, globs);

  return Promise.each(filepaths, function (filepath) {
    var table, basename, relative;

    // Create table of contents
    return fs.readFile(filepath, 'utf8')
      .then(function (file) {
        table = toc(file);

        basename = path.basename(filepath, '.md');
        relative = path.relative(dir, filepath);

        // Add filename as a heading; prepend filename to links
        table = format('### [%s](%s)\n%s', basename, relative, table)
          .replace(/\(#/g, format('(%s#', relative));

        return table;
      });
  })
    .then(function (tables) {
      return tables.join('\n');
    })
    .nodeify(callback);
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

  return fs.readFile(filepath, 'utf8')
    .then(function (str) {
      return fs.writeFile(filepath, str
        .replace(/(<!--\s*TOC\s*-->)[\S\s]*(<!--\s*\/TOC\s*-->)/i,
        format('$1\n%s\n$2', toc)));
    })
    .nodeify(callback);
};

module.exports = markdownIndex;

'use strict';

const redent = require('redent');
const path = require('path');

const load = require('./load');
const support = require('../support');

module.exports = (filename, source, opts) => {
  if (source.charAt(0) === '\uFEFF') {
    source = source.slice(1);
  }

  const options = opts || {};

  const dirname = path.dirname(filename);
  const src = path.basename(filename);
  const parts = src.split('.');
  const delims = Array.isArray(options.delims) ? options.delims : [options.delims || '---'];

  const start = source.indexOf(`${delims[0]}\n`);
  const end = source.indexOf(`${delims[1] || delims[0]}\n`, start + delims[0].length);

  let fm;
  let data;

  const name = parts.shift();
  const exts = options.extensions || {};
  const hasMkd = support.hasMarkdown(parts);

  if (parts.length === 1 && exts[parts[0]]) {
    Array.prototype.unshift.call(parts, exts[parts[0]]);
  }

  // extract front-matter
  const ls = source.substr(start - 1, 1);
  const rs = source.substr(end - 1, 1);

  if ((end > start && start >= 0) && (ls === ' ' || ls === '\n' || ls === '') && (rs === ' ' || rs === '\n' || rs === '')) {
    let error;

    const slen = delims[0].length;
    const elen = (delims[1] || delims[0]).length;

    try {
      const raw = source.substr(start + slen + 1, end - (start + elen + 1));

      fm = load(filename, redent(raw));

      // cleanup
      fm.clr = () => {
        // fill with blank lines to help source-maps tools
        if (!fm._fixed) {
          fm._fixed = `${source.substr(0, start)}${
            new Array(raw.split('\n').length + 1).join('\n')
          }${source.substr(end + elen)}`;
        }

        return fm._fixed;
      };

      // strip front-matter for non-markdown sources
      if (!hasMkd || options.frontMatter === false) {
        source = fm.clr();
      }

      data = fm.obj;
    } catch (e) {
      error = e;
    }

    if (error) {
      error.message = error.reason;
      error.filename = filename;
      delete error.mark;
      throw error;
    }
  }

  if (hasMkd && data && data.$render) {
    source = fm.clr();
  }

  return {
    filename,
    dirname,
    options,
    source,
    parts,
    name,
    data: data || {},
    deps: fm ? fm.src : [],
    isScript: support.hasScripting(parts),
  };
};

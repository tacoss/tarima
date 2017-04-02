'use strict';

const redent = require('redent');
const path = require('path');

const load = require('./load');

module.exports = (filename, source, options) => {
  if (source.charAt(0) === '\uFEFF') {
    source = source.slice(1);
  }

  options = options || {};

  const parts = path.basename(filename).split('.');
  const delims = Array.isArray(options.delims) ? options.delims : [options.delims || '---'];

  const start = source.indexOf(`${delims[0]}\n`);
  const end = source.indexOf(`${delims[1] || delims[0]}\n`, start + 1);

  let fm;
  let data;

  const name = parts.shift();
  const exts = options.extensions || {};

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

      // strip front-matter for non-markdown sources
      if (parts.indexOf('litcoffee') === -1
        && parts.indexOf('md') === -1
        && parts.indexOf('mkd') === -1) {
        // fill with blank lines to help source-maps tools
        const lines = new Array(raw.split('\n').length + 1).join('\n');

        source = `${source.substr(0, start)}${lines}${source.substr(end + elen)}`;
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

  return {
    filename,
    options,
    source,
    parts,
    name,
    data: data || {},
    deps: fm ? fm.src : [],
  };
};

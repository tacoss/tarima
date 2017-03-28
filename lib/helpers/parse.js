'use strict';

const redent = require('redent');
const path = require('path');

const load = require('./load');

module.exports = function(filename, source, options) {
   if (source.charAt(0) === '\uFEFF') {
    source = source.slice(1);
  }

  options = options || {};

  const parts = path.basename(filename).split('.');
  const delims = Array.isArray(options.delims) ? options.delims : [options.delims || '---'];

  const start = source.indexOf(delims[0] + '\n');
  const end = source.indexOf((delims[1] || delims[0]) + '\n', start + 1);

  let fm;
  let data;

  // extract front-matter
  const ls = source.substr(start - 1, 1);
  const rs = source.substr(end - 1, 1);

  if ((end > start && start >= 0) && (ls === ' ' || ls === '\n' || ls === '') && (rs === ' ' || rs === '\n' || rs === '')) {
    let error;

    const slen = delims[0].length;
    const elen = (delims[1] || delims[0]).length;

    try {
      fm = load(filename, redent(source.substr(start + slen + 1, end - (start + elen + 1))));
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
    filename: filename,
    options: options,
    source: source,
    parts: parts.slice(1),
    name: parts.shift(),
    data: data || {},
    deps: fm ? fm.src : [],
  };
};

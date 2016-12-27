var path = require('path'),
    redent = require('redent');

var load = require('./load'),
    support = require('../support');

module.exports = function(filename, source, options) {
   if (source.charAt(0) === '\uFEFF') {
    source = source.slice(1);
  }

  options = options || {};

  var parts = path.basename(filename).split('.'),
      delims = Array.isArray(options.delims) ? options.delims : [options.delims || '---'];

  var start = source.indexOf(delims[0] + '\n'),
      end = source.indexOf((delims[1] || delims[0]) + '\n', start + 1);

  var fm, data;

  // extract front-matter
  var ls = source.substr(start - 1, 1),
      rs = source.substr(end - 1, 1);

  if ((end > start && start >= 0) && (ls === ' ' || ls === '\n' || ls === '') && (rs === ' ' || rs === '\n' || rs === '')) {
    var error;

    var tmp = source;

    var slen = delims[0].length,
        elen = (delims[1] || delims[0]).length;

    var line = source.substr(0, start + slen).split('\n').length;
    var column = source.substr(start + slen + 1).split('\n')[0].match(/^\s*/)[0].length;

    try {
      fm = load(filename, redent(source.substr(start + slen + 1, end - (start + elen + 1))));
      source = source.substr(0, start - slen + 1) + source.substr(end + elen);
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

  var isScript = support.isScript(parts),
      isTemplate = support.isTemplate(parts);

  return {
    filename: filename,
    options: options,
    source: source,
    parts: parts.slice(1),
    name: parts.shift(),
    data: data || {},
    deps: fm ? fm.src : [],
    isScript: isScript > isTemplate,
    isTemplate: isTemplate > isScript
  };
};

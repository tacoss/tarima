var path = require('path'),
    redent = require('redent');

var load = require('./load');

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

  if ((end > start && start >= 0) && (ls === ' ' || ls === '\n' || ls === '') || (rs === ' ' || rs === '\n' || rs === '')) {
    var slen = delims[0].length,
        elen = (delims[1] || delims[0]).length;

    fm = redent(source.substr(start + slen + 1, end - (start + elen + 1)));
    source = source.substr(0, start - slen + 1) + source.substr(end + elen);

    try {
      data = load(filename, fm);
    } catch (e) {
      throw new Error('Cannot parse front-matter `' + fm + '`');
    }
  }

  return {
    filename: filename,
    options: options,
    source: source,
    parts: parts.slice(1),
    name: parts.shift(),
    data: data ? data.obj : {},
    deps: data ? data.src : []
  };
};

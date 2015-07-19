'use strict';

module.exports = function(path, options) {
  var ext, name, parts, fullpath, filename;

  fullpath = path.split('/');
  filename = fullpath.pop();

  parts = filename.split('.');
  name = parts.shift();

  var offset;

  if (Array.isArray(options.raw)) {
    for (var key in options.raw) {
      var test = parts.indexOf(options.raw[key]);

      if (test > 0) {
        offset = test;
        break;
      }
    }
  }

  if (offset > 0) {
    ext = parts.slice(0, offset + 1).join('.');
    parts.splice(0, offset);
  } else {
    ext = parts[0];
  }

  return {
    filepath: fullpath.join('/'),
    filename: filename,
    parts: parts,
    name: name,
    ext: ext
  };
};

'use strict';

module.exports = function(path) {
  var ext, name, parts, fullpath, filename;

  fullpath = path.split('/');
  filename = fullpath.pop();

  parts = filename.split('.');
  name = parts.shift();
  ext = parts[0];

  return {
    filepath: fullpath.join('/'),
    filename: filename,
    parts: parts,
    name: name,
    ext: ext
  };
};

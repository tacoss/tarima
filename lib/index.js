var fs = require('fs'),
    path = require('path');

var render = require('./helpers/render');

function partial(params) {
  return function(locals, cb) {
    if (typeof locals === 'function') {
      cb = locals;
      locals = {};
    }

    var parts = path.basename(params.filename).split('.'),
        name = parts.shift(),
        ext = parts[0];

    render({
      ext: ext,
      name: name,
      parts: parts,
      locals: locals || {},
      source: params.source,
      options: params.options,
      filename: params.filename
    }, cb);
  };
}

module.exports = {
  load: function(filename, options) {
    return this.parse(filename, fs.readFileSync().toString(), options);
  },
  parse: function(filename, source, options) {
    return {
      render: partial({
        filename: filename,
        options: options || {},
        source: source || ''
      })
    };
  },
  bundle: function() {}
};

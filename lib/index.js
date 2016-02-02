var fs = require('fs');

var util = require('./util');

function partial(params) {
  return function(locals, cb) {
    if (typeof locals === 'function') {
      cb = locals;
      locals = {};
    }

    util.render(params.filename.split('.').slice(1), {
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

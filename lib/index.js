var fs = require('fs');

var render = require('./helpers/render');

function partial(params) {
  return function(locals, cb) {
    if (typeof locals === 'function') {
      cb = locals;
      locals = {};
    }

    render({
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

var fs = require('fs'),
    path = require('path');

var map = require('./helpers/map'),
    render = require('./helpers/render'),
    setupFilters = require('./helpers/setup-filters');

function partial(params) {
  return function(locals, cb) {
    if (typeof locals === 'function') {
      cb = locals;
      locals = {};
    }

    params.locals = locals || {};
    params.parts = path.basename(params.filename).split('.');
    params.name = params.parts.shift();
    params.ext = params.parts[0];

    var filters = setupFilters(params);

    map(params, filters, function(err) {
      if (!err) {
        render(params, cb);
      } else {
        cb(err);
      }
    });
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

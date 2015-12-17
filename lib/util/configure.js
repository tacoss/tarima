'use strict';

var defaults = require('./defaults');

module.exports = function(config) {
  return function(type, params) {
    var opts = {
      data: {}
    };

    if (params.options.client) {
      opts.client = true;
    }

    if (params.options.filename) {
      opts.filename = params.options.filename;
    }

    defaults(opts.data, params.data);
    defaults(opts.data, params.options.data);

    if (params.options[type]) {
      defaults(opts, params.options[type]);
    }

    if (config[type]) {
      defaults(opts, config[type]);
    }

    return opts;
  };
};

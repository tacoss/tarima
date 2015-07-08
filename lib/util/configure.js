'use strict';

var defaults = require('./defaults');

module.exports = function(config) {
  return function(type, params) {
    var opts = {};

    if (params.options[type]) {
      defaults(opts, params.options[type]);
    }

    defaults(opts, params.options);

    if (config[type]) {
      defaults(opts, config[type]);
    }

    delete opts[type];

    return opts;
  };
};

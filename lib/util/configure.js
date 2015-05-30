'use strict';

var defaults = require('./defaults');

module.exports = function(config) {
  return function(type, params) {
    var opts = {};

    defaults(opts, params.options);

    if (config[type]) {
      defaults(opts, config[type]);
    }

    if (params.options && params.options[type]) {
      defaults(opts, params.options[type]);
    }

    return opts;
  };
};

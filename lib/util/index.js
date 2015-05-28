'use strict';

var config = {
  coffee: {
    bare: true
  },
  jade: {
    compileDebug: false,
    cache: true
  },
  less: {
    async: false
  },
  marked: {
    gfm: true,
    tables: true,
    breaks: false,
    pedantic: false,
    sanitize: true,
    smartLists: true,
    smartypants: false
  }
};

var _ = require('lodash');

var defaults = _.partialRight(_.assign, function(a, b) {
  return typeof a === 'undefined' ? b : a;
});

function configure(type, params) {
  var opts = {};

  defaults(opts, params.options);

  if (config[type]) {
    defaults(opts, config[type]);
  }

  if (params.options && params.options[type]) {
    defaults(opts, params.options[type]);
  }

  return opts;
}

module.exports = {
  reduce: require('./reduce'),
  options: require('./options'),
  defaults: defaults,
  configure: configure
};

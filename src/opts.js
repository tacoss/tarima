
var options = {
  coffee: {
    bare: true
  },
  jade: {
    compileDebug: false
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

var defs_tpl = function(type, params) {
  var opts = {};

  defaults(opts, params.options);

  if (options[type]) {
    defaults(opts, options[type]);
  }

  if (params.options && params.options[type]) {
    defaults(opts, params.options[type]);
  }

  return opts;
};

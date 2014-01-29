
var options = {
  coffee: {
    bare: true
  },
  jade: {
    compileDebug: false
  },
  ejs: {
    client: true,
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

var _ = require('lodash'),
    toSource = require('tosource');

var defaults = _.partialRight(_.assign, function(a, b) {
  return typeof a === 'undefined' ? b : a;
});

var defs_tpl = function(type, params) {
  var opts = {};

  defaults(opts, params);

  if (options[type]) {
    defaults(opts, options[type]);
  }

  return opts;
};

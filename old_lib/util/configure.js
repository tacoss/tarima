var defaults = require('./defaults');

var config = {
  coffee: {
    bare: true
  },
  jade: {
    compileDebug: true,
    doctype: 'html5',
    pretty: true,
    cache: false
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
    smartypants: true
  },
  jisp: {
    wrap: false,
    pretty: true,
    topScope: false,
    isTopLevel: true
  },
  styl: {
    whitespace: true
  },
  ejs: {
    compileDebug: true
  }
};

module.exports = function(type, params) {
  var opts = {
    data: {}
  };

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

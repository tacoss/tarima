'use strict';

var settings = {
  coffee: {
    bare: true
  },
  jade: {
    basedir: process.cwd(),
    compileDebug: false,
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
  }
};

module.exports = {
  copy: require('./copy'),
  merge: require('./merge'),
  reduce: require('./reduce'),
  bundler: require('./bundler'),
  options: require('./options'),
  defaults: require('./defaults'),
  configure: require('./configure')(settings)
};

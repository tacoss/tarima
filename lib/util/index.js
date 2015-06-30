'use strict';

var defaults = {
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
  }
};

module.exports = {
  copy: require('./copy'),
  merge: require('./merge'),
  reduce: require('./reduce'),
  options: require('./options'),
  defaults: require('./defaults'),
  configure: require('./configure')(defaults)
};

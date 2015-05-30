'use strict';

var defaults = {
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

module.exports = {
  copy: require('./copy'),
  merge: require('./merge'),
  reduce: require('./reduce'),
  options: require('./options'),
  defaults: require('./defaults'),
  configure: require('./configure')(defaults)
};

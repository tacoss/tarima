var $ = require('../../helpers/resolve');

var buble;

// TODO: https://twitter.com/pateketrueke/status/699480959058489344
// TODO: add support for babel or more transpilers?

function compile(params) {
  if (!params.next) {
    buble = buble || require($('buble'));

    var opts = params.options.buble || {};

    opts.filename = params.filename;

    params.source = buble.transform(params.source, opts).code;
  }
}

module.exports = {
  ext: 'js',
  type: 'script',
  support: ['es6'],
  requires: ['buble'],
  render: compile,
  compile: compile
};

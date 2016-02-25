var $ = require('../helpers/resolve');

var babel;

// TODO: https://twitter.com/pateketrueke/status/699480959058489344

function compile(params) {
  if (!params.next) {
    babel = babel || require($('babel-core'));

    var opts = {
      filename: params.filename
    };

    if (babel.version.split('.')[0] > 5) {
      opts.presets = $('babel-preset-es2015') ? ['es2015'] : [];
    }

    params.source = babel.transform(params.source, opts).code;
  }
}

module.exports = {
  ext: 'js',
  type: 'script',
  support: ['es6', 'jsx'],
  requires: ['babel-core@^5'],
  render: compile,
  compile: compile
};

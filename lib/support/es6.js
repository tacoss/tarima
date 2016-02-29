var $ = require('../helpers/resolve');

var babel;

// TODO: https://twitter.com/pateketrueke/status/699480959058489344

function compile(params) {
  if (!params.next) {
    babel = babel || require($('babel-core'));

    var opts = {
      filename: params.filename
    };

    var es2015;

    // TODO: merge params.options.babel

    if (babel.version.split('.')[0] > 5 && (es2015 = $('babel-preset-es2015'))) {
      opts.presets = [es2015];
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

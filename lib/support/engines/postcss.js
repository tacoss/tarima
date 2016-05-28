var tosource = require('tosource');

var postcss;

function compile(params) {
  if (!params.next || params.next === 'js') {
    postcss = postcss || require('postcss');

    var opts = params.options.postcss || {};

    params.from = params.filename;
    params.to = params.filename;

    var plugins = opts.plugins || [];

    delete opts.plugins;

    return postcss(plugins)
      .process(params.source, opts)
      .then(function (result) {
        var code = result.css;

        if (params.next) {
          code = 'function(){return ' + tosource(code) + ';}';
        }

        params.source = code;
      });
  }
}

module.exports = {
  ext: 'js',
  type: 'script',
  support: ['css'],
  requires: ['postcss'],
  render: compile,
  compile: compile
};

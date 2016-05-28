var tosource = require('tosource');

var postcss;

function compile(params) {
  if (params.options.postcss && (!params.next || params.next === 'js')) {
    postcss = postcss || require('postcss');

    var opts = params.options.postcss || {};

    if (typeof opts !== 'object') {
      opts = {};
    }

    opts.from = params.filename;
    opts.to = params.filename;

    var plugins = opts.plugins || [];

    delete opts.plugins;

    // TODO: implements dependency tracking
    var deps = [];

    postcss(plugins)
      .process(params.source, opts)
      .then(function (result) {
        var code = result.css;

        if (params.next) {
          code = 'function(){return ' + tosource(code) + ';}';
        }

        params.source = code;
      });

    return deps;
  }
}

module.exports = {
  ext: 'css',
  type: 'template',
  support: ['css'],
  requires: ['postcss'],
  render: compile,
  compile: compile
};

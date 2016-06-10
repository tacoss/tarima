var tosource = require('tosource');

var postcss;

function compile(params) {
  if (params.next === 'post' || params.next === 'js') {
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

        if (params.next === 'js') {
          code = 'function(){return ' + tosource(code) + ';}';
        }

        params.source = code;
      });

    return deps;
  }
}

module.exports = {
  type: 'template',
  support: ['post', 'css'],
  requires: ['postcss'],
  render: compile,
  compile: compile
};

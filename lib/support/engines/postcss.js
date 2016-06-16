var tosource = require('tosource');

var postcss;

function compile(params, cb) {
  if (params.next === 'post' || params.next === 'js') {
    postcss = postcss || require('postcss');

    var opts = params.options.postcss || {};

    if (typeof opts !== 'object') {
      opts = {};
    }

    opts.from = params.filename;
    opts.to = params.filename;

    var deps = [];

    var plugins = (opts.plugins || [])
      .map(function(test) {
        var fixedPlugin = typeof test === 'string' ? require(test) : test;

        if (test === 'postcss-import') {
          fixedPlugin = fixedPlugin({
            onImport: function(files) {
              Array.prototype.push.apply(deps, files);
            }
          });
        }

        return fixedPlugin;
      });

    postcss(plugins)
      .process(params.source, opts)
      .then(function (result) {
        var code = result.css;

        if (params.next === 'js') {
          code = 'function(){return ' + tosource(code) + ';}';
        }

        params.source = code;

        cb(undefined, deps);
      })
      .catch(cb);
  } else {
    cb();
  }
}

module.exports = {
  type: 'template',
  support: ['post', 'css'],
  requires: ['postcss'],
  render: compile,
  compile: compile
};

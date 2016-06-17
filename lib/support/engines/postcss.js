var loadPlugins = require('../../helpers/load-plugins');

var tosource = require('tosource');

var postcss;

function compile(params, cb) {
  if (params.next === 'post' || params.next === 'js') {
    postcss = postcss || require('postcss');

    var opts = params.options.postcss || {};

    if (typeof opts !== 'object') {
      opts = {};
    }

    var deps = [];

    opts['postcss-import'] = opts['postcss-import'] || {};
    opts['postcss-import'].onImport = function(files) {
      Array.prototype.push.apply(deps, files);
    };

    opts.from = params.filename;
    opts.to = params.filename;

    postcss(loadPlugins(opts.plugins || [], opts))
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

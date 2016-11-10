var loadPlugins = require('../../helpers/load-plugins');

var fs = require('fs'),
    path = require('path'),
    tosource = require('tosource');

var _cached = {};

function compile(params, cb) {
  if (params.next === 'post' || params.next === 'js') {
    var opts = params.options.postcss || {};

    if (typeof opts !== 'object') {
      opts = {};
    }

    var deps = [];

    opts['postcss-import'] = opts['postcss-import'] || {};

    opts['postcss-import'].load = function(file) {
      var _key = path.relative(params.options.cwd, file);
      var _entry = params.options.cache[_key] || {};

      if (!_cached[_key] || _entry.dirty) {
        _cached[_key] = fs.readFileSync(file).toString();
      }

      return _cached[_key];
    };

    opts['postcss-import'].onImport = function(files) {
      files.forEach(function(file) {
        if (file !== params.filename && deps.indexOf(file) === -1) {
          deps.push(file);
        }
      });
    };

    opts.from = params.filename;
    opts.to = params.filename;

    var postcss = this.postcss;

    postcss(loadPlugins(opts.plugins || [], opts))
      .process(params.source, opts)
      .then(function (result) {
        result.warnings().forEach(function(msg) {
          console.warn('[postcss] ' + msg.type  + ': ' + msg.text + ' at ' + params.filename);
        });

        var code = result.css;

        if (params.next === 'js') {
          code = 'function(){return ' + tosource(code) + ';}';
        }

        params.source = code;

        cb(undefined, deps);
      })
      .catch(function(err) {
        cb(err);
      });
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

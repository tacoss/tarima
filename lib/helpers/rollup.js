var Rollup;

var fs = require('fs'),
    path = require('path');

var loadPlugins = require('./load-plugins'),
    support = require('../support');

var _render = require('./_render');

function exists(file) {
  try {
    return fs.statSync(file).isFile();
  } catch (e) {
    return false;
  }
}

module.exports = function(options, params, done) {
  Rollup = Rollup || require('rollup');

  options = options || {};

  var _cache = options._cache;
  var _bundle = options._bundle;

  var rollupOptions = options.rollup || {};
  var ignoredPaths = ['node_modules', 'bower_components'].concat(options.bundleIgnore || []);

  var exts = support.getKnownExtensions();

  Rollup.rollup({
    cache: _bundle,
    entry: params.filename,
    plugins: loadPlugins(rollupOptions.plugins || [], rollupOptions).concat([{
      resolveId: function(importee, importer) {
        if (!importer) {
          return importee;
        }

        var fixedModule = path.resolve(path.dirname(importer), importee);

        var i;

        for (i in exts) {
          if (exists(fixedModule + exts[i])) {
            return fixedModule + exts[i];
          }

          if (exists(path.join(fixedModule, 'index' + exts[i]))) {
            return path.join(fixedModule, 'index' + exts[i]);
          }
        }
      },
      load: function(id) {
        var _key = options.cwd ? path.relative(options.cwd, id) : id;

        if (_cache && _cache[_key]) {
          return _cache[_key];
        }

        for (var i = 0, c = ignoredPaths.length; i < c; i += 1) {
          if (_key.indexOf(ignoredPaths[i]) > -1) {
            return null;
          }
        }

        if (!support.isSupported(id)) {
          return null;
        }

        if (id === params.filename) {
          return params.source;
        }

        return _render(id, fs.readFileSync(id).toString(), params)
          .then(function(result) {
            if (!_cache) {
              return {
                code: result.source,
                map: result.sourceMap
              };
            }

            _cache[_key] = {
              code: result.source,
              map: result.sourceMap
            };

            return _cache[_key];
          });
      }
    }])
  }).then(function(bundle) {
    var bundleName = typeof params.data._bundle === 'string'
      ? params.data._bundle
      : rollupOptions.bundle || 'main';

    var output = bundle.generate({
      useStrict: false,
      moduleName: bundleName,
      format: params.data._format || rollupOptions.format || 'iife'
    });

    bundle.modules.forEach(function(dep) {
      if (params.filename !== dep.id) {
        params.deps.push(dep.id);
      }
    });

    params.source = output.code;
    params._bundle = bundle;

    done(undefined, params);
  }).catch(function(error) {
    // TODO: fix errors...
    done(error);
  });
};

var Rollup;

var fs = require('fs'),
    path = require('path'),
    tosource = require('tosource'),
    Promise = require('es6-promise').Promise;

var loadPlugins = require('./load-plugins'),
    support = require('../support'),
    render = require('./render'),
    parse = require('./parse');

function exists(file) {
  try {
    return fs.statSync(file).isFile();
  } catch (e) {
    return false;
  }
}

var _cache = {};

module.exports = function(options, params, done) {
  Rollup = Rollup || require('rollup');

  options = options || {};

  var rollupOptions = options.rollup || {};

  Rollup.rollup({
    entry: params.filename,
    plugins: loadPlugins(rollupOptions.plugins || [], rollupOptions).concat([{
      resolveId: function(importee, importer) {
        if (!importer) {
          return importee;
        }

        var fixedModule = path.resolve(path.dirname(importer), importee);

        var i, exts = support.getKnownExtensions();

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
        if (id === params.filename) {
          return params.source;
        }

        if (!support.isSupported(id)) {
          return null;
        }

        return new Promise(function(resolve, reject) {
          var _key = options.cwd ? path.relative(options.cwd, id) : id;
          var _entry = (options.cache && options.cache[_key]) || {};

          if (_cache[_key] && !_entry.dirty) {
            return resolve(_cache[_key]);
          }

          var partial = parse(id, fs.readFileSync(id).toString(), params.options);

          Object.keys(partial.data).forEach(function(key) {
            if (typeof params.data[key] === 'undefined') {
              params.data[key] = partial.data[key];
            }
          });

          partial.deps.forEach(function(dep) {
            if (params.deps.indexOf(dep) === -1) {
              params.deps.push(dep);
            }
          });

          // hidden flag
          partial._rollup = true;

          render(partial, function(e, out) {
            /* istanbul ignore if */
            if (e) {
              return reject(e);
            }

            if (out.extension !== 'js') {
              out.source = 'function(){return ' + tosource(out.source.trim()) + ';};';
            }

            if (support.isTemplateFunction(out.source)) {
              out.source = 'export default ' + out.source + ';';
            }

            var prefix = out.runtimes.join('\n');

            if (prefix) {
              out.source = prefix + '\n' + out.source;
            }

            out.deps.forEach(function(dep) {
              if (params.deps.indexOf(dep) === -1) {
                params.deps.push(dep);
              }
            });

            _cache[_key] = out.source;

            resolve(_cache[_key]);
          });
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
    params._import = true;

    done(undefined, params);
  }).catch(function(error) {
    // TODO: fix errors...
    done(error);
  });
};

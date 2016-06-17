var Rollup;

var fs = require('fs'),
    path = require('path'),
    tosource = require('tosource'),
    Promise = require('es6-promise').Promise;

var support = require('../support'),
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

  var dirty = options.dirtyFiles || {};

  var rollupOptions = options.rollup || {};

  Rollup.rollup({
    entry: params.filename,
    plugins: (rollupOptions.plugins || []).map(function(plugin) {
      return typeof plugin === 'string' ? require(plugin)() : plugin;
    }).concat([{
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
          if (!dirty[id] && _cache[id]) {
            return resolve(_cache[id]);
          }

          var partial = parse(id, fs.readFileSync(id).toString(), params.options);

          Array.prototype.push.apply(params.deps, partial.deps);

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

            _cache[id] = out.source;
            resolve(out.source);
          });
        });
      }
    }])
  }).then(function(bundle) {
    var bundleName = typeof params.data._bundle === 'string'
      ? params.data._bundle
      : 'main';

    var output = bundle.generate({
      moduleName: bundleName,
      format: params.data._format || rollupOptions.format || 'iife'
    });

    bundle.modules.forEach(function(dep) {
      if (params.filename !== dep.id) {
        params.deps.push(dep.id);
      }
    });

    params.source = output.code;

    done(undefined, params);
  }).catch(function(error) {
    // TODO: fix errors...
    done(error);
  });
};

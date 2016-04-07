var $ = require('./resolve');

var Rollup;

var fs = require('fs'),
    path = require('path'),
    tosource = require('tosource'),
    Promise = require('es6-promise').Promise;

var support = require('../support'),
    render = require('./render'),
    parse = require('./parse');

module.exports = function(options, params, done) {
  Rollup = Rollup || require($('rollup'));

  Rollup.rollup({
    entry: params.filename,
    plugins: [{
      resolveId: function(importee, importer) {
        if (!importer) {
          return importee;
        }

        var fixedModule = path.resolve(path.dirname(importer), importee);

        var i, exts = support.getKnownExtensions();

        for (i in exts) {
          if (fs.existsSync(fixedModule + exts[i])) {
            return fixedModule + exts[i];
          }

          if (fs.existsSync(path.join(fixedModule, 'index' + exts[i]))) {
            return path.join(fixedModule, 'index' + exts[i]);
          }
        }

        throw new Error('Unable to load module: ' + importee);
      },
      load: function(id) {
        if (id === params.filename) {
          return params.source;
        }

        return new Promise(function(resolve, reject) {
          render(parse(id, fs.readFileSync(id).toString(), params.options), function(e, out) {
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

            resolve(out.source);
          });
        });
      }
    }]
  }).then(function(bundle) {
    var bundleName = typeof params.data._bundle === 'string'
      ? params.data._bundle
      : 'main';

    var output = bundle.generate({
      moduleName: bundleName,
      format: 'iife'
    });

    bundle.modules.forEach(function(dep) {
      if (params.filename !== dep.id) {
        params.dependencies.push(dep.id);
      }
    });

    params.source = output.code;

    done(undefined, params);
  }).catch(function(error) {
    done(error);
  });
};

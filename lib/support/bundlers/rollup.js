'use strict';

let Rollup;

const fs = require('fs');
const path = require('path');

const merge = require('../../helpers/merge');
const parse = require('../../helpers/parse');
const render = require('../../helpers/render');
const toArray = require('../../helpers/to-array');
const support = require('../../support');

const loadPlugins = require('../../helpers/load-plugins');

function exists(file) {
  try {
    return fs.statSync(file).isFile();
  } catch (e) {
    return false;
  }
}

module.exports = (options, params, done) => {
  /* eslint-disable global-require */
  Rollup = Rollup || require('rollup');

  options = options || {};

  const _cache = options._cache;
  const _bundle = options._bundle;

  const rollupOptions = merge({}, options.rollup || {});
  const ignoredPaths = ['node_modules', 'bower_components'].concat(options.bundleIgnore || []);

  const exts = support.getExtensions();

  Rollup.rollup({
    cache: _bundle,
    input: params.filename,
    onwarn: rollupOptions.onwarn,
    external: toArray(params.data.$external).concat(toArray(rollupOptions.external))
      .concat(toArray(options.external ? Object.keys(options.external) : [])),
    plugins: loadPlugins(rollupOptions.plugins || [], rollupOptions).concat([{
      resolveId(importee, importer) {
        if (!importer) {
          return importee;
        }

        const fixedModule = importee.indexOf('~/') === 0
          ? path.resolve(options.cwd || '.', importee.substr(2))
          : path.resolve(path.dirname(importer), importee);

        if (exists(fixedModule)) {
          return fixedModule;
        }

        for (let i = 0, c = exts.length; i < c; i += 1) {
          if (exists(fixedModule + exts[i])) {
            return fixedModule + exts[i];
          }

          if (exists(path.join(fixedModule, `index${exts[i]}`))) {
            return path.join(fixedModule, `index${exts[i]}`);
          }
        }
      },
      load(id) {
        const _key = options.cwd ? path.relative(options.cwd, id) : id;

        if (_cache && _cache[_key]) {
          return _cache[_key];
        }

        for (let i = 0, c = ignoredPaths.length; i < c; i += 1) {
          if (_key.indexOf(ignoredPaths[i]) > -1) {
            return null;
          }
        }

        if (!support.isSupported(id)) {
          return null;
        }

        if (id === params.filename) {
          return {
            code: params.source,
            map: params.sourceMap,
          };
        }

        return new Promise((resolve, reject) => {
          const sub = parse(id, fs.readFileSync(id).toString(), params.options);

          sub._import = true;

          render(sub, (err, result) => {
            if (err) {
              reject(err);
              return;
            }

            if (!sub.isScript) {
              result.source = `export default ${support.wrapOutput(result.source)}`;
            }

            result.runtimes.forEach(code => {
              if (params.runtimes.indexOf(code) === -1) {
                params.runtimes.push(code);
              }
            });

            result.deps.forEach(dep => {
              if (params.deps.indexOf(dep) === -1) {
                params.deps.push(dep);
              }
            });

            Object.keys(result.data).forEach(key => {
              if (typeof params.data[key] === 'undefined') {
                params.data[key] = result.data[key];
              }
            });

            if (!_cache) {
              resolve({
                code: result.source,
                map: result.sourceMap,
              });
              return;
            }

            _cache[_key] = {
              code: result.source,
              map: result.sourceMap,
            };

            resolve(_cache[_key]);
          });
        });
      },
    }]),
  }).then(bundle => {
    const bundleName = typeof params.data.$bundle === 'string'
      ? params.data.$bundle
      : rollupOptions.bundle || 'main';

    return bundle.generate({
      strict: false,
      name: bundleName,
      sourcemap: options.sourceMaps || options.compileDebug,
      format: params.data.$format || rollupOptions.format || 'iife',
      globals: merge({}, params.data.$globals, rollupOptions.globals, options.external),
    })
    .then(output => {
      bundle.modules.forEach(dep => {
        if (params.filename !== dep.id) {
          params.deps.push(dep.id);
        }
      });

      params._bundle = bundle;
      params.source = output.code;
      params.sourceMap = output.map;

      done();
    });
  }).catch(done);
};

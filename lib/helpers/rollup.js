'use strict';

let Rollup;

const fs = require('fs');
const path = require('path');

const merge = require('./merge');
const parse = require('./parse');
const render = require('./render');
const support = require('../support');

const loadPlugins = require('./load-plugins');

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
    entry: params.filename,
    plugins: loadPlugins(rollupOptions.plugins || [], rollupOptions).concat([{
      resolveId(importee, importer) {
        if (!importer) {
          return importee;
        }

        const fixedModule = path.resolve(path.dirname(importer), importee);

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
          return params.source;
        }

        return new Promise((resolve, reject) => {
          const sub = parse(id, fs.readFileSync(id).toString(), params.options);

          if (!sub.isScript && sub.parts[0] !== 'js') {
            sub.parts.unshift('js');
          }

          sub.isScript = true;
          sub._import = true;

          render(sub, (err, result) => {
            if (err) {
              reject(err);
              return;
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
    const bundleName = typeof params.data._bundle === 'string'
      ? params.data._bundle
      : rollupOptions.bundle || 'main';

    const output = bundle.generate({
      useStrict: false,
      moduleName: bundleName,
      format: params.data._format || rollupOptions.format || 'iife',
    });

    bundle.modules.forEach(dep => {
      if (params.filename !== dep.id) {
        params.deps.push(dep.id);
      }
    });

    params.source = output.code;
    params._bundle = bundle;

    done();
  }).catch(done);
};

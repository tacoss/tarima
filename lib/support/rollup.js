'use strict';

let Rollup;

const os = require('os');
const fs = require('fs');
const path = require('path');
const http = require('http');
const https = require('https');

const merge = require('../helpers/merge');
const parse = require('../helpers/parse');
const render = require('../helpers/render');
const support = require('./index');

const loadPlugins = require('../helpers/load-plugins');
const resolveDeps = require('../helpers/resolve-deps');

const TEMP_DIR = fs.realpathSync(os.tmpdir());

function toArray(value) {
  if (Array.isArray(value)) {
    return value;
  }

  return value ? String(value).split(/\W/) : [];
}

function isFile(file) {
  try {
    return fs.statSync(file).isFile();
  } catch (e) {
    return false;
  }
}

function isUrl(id) {
  return /^(https?:)?\/\//.test(id);
}

function locateFile(fixedModule) {
  const exts = support.getExtensions();

  for (let i = 0, c = exts.length; i < c; i += 1) {
    let file = path.join(fixedModule + exts[i]);

    if (isFile(file)) {
      return file;
    }

    file = path.join(fixedModule, `index${exts[i]}`);
    if (isFile(file)) {
      return file;
    }
  }
}

function getDynamicPlugin(rollupOptions, options, params) {
  const ignoredPaths = ['node_modules', 'bower_components'].concat(options.bundleIgnore || []);

  return {
    name: 'tarima-loader',
    resolveId(importee, importer) {
      if (!importer || isUrl(importee)) {
        return importee;
      }

      // allow web_modules (aka snowpack)
      if (rollupOptions.aliases && rollupOptions.aliases[importee]) {
        if (rollupOptions.aliases[importee].charAt() === '.') {
          return path.resolve(rollupOptions.aliases[importee]);
        }

        return require.resolve(rollupOptions.aliases[importee]);
      }

      let fixedModule = importee.indexOf('~/') === 0
        ? path.resolve(options.cwd || '.', importee.substr(2))
        : path.resolve(path.dirname(importer), importee);

      fixedModule = locateFile(fixedModule);
      if (fixedModule) return fixedModule;

      const folders = (options.paths || [])
        .map(x => path.resolve(options.cwd || '.', x));

      folders.unshift(path.dirname(importer));

      for (let j = 0; j < folders.length; j += 1) {
        fixedModule = locateFile(path.join(folders[j], importee));
        if (fixedModule) return fixedModule;
      }
    },
    load(id) {
      if (isUrl(id)) {
        return new Promise((resolve, reject) => {
          const dest = path.join(TEMP_DIR, id.replace(/\W/g, '_'));

          if (!fs.existsSync(dest)) {
            const file = fs.createWriteStream(dest);

            (id.indexOf('https:') !== -1 ? https : http)
              .get(id, response => {
                response.pipe(file);
                file.on('finish', () => file.close(() => resolve(fs.readFileSync(dest).toString())));
              }).on('error', err => {
                fs.unlink(dest);
                reject(err);
              });
          } else {
            resolve(fs.readFileSync(dest).toString());
          }
        });
      }

      const _key = options.cwd ? path.relative(options.cwd, id) : id;

      if (options._cache && options._cache[_key]) {
        return options._cache[_key];
      }

      for (let i = 0, c = ignoredPaths.length; i < c; i += 1) {
        if (_key.indexOf(ignoredPaths[i]) > -1) {
          return null;
        }
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

          if (!sub.isScript && support.isSupported(id)) {
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

          if (!options._cache) {
            resolve({
              code: result.source,
              map: result.sourceMap,
            });
            return;
          }

          options._cache[_key] = {
            code: result.source,
            map: result.sourceMap,
          };

          resolve(options._cache[_key]);
        });
      });
    },
  };
}

function getDefaultsFrom(rollupOptions, options, params) {
  options = options || {};

  const includes = (options.include || []).concat(params.data.$include || []);

  return {
    cache: options._bundle,
    input: params.filename,

    onwarn: rollupOptions.onwarn || ((warning, rollupWarn) => {
      if (warning.code !== 'CIRCULAR_DEPENDENCY') {
        rollupWarn(warning);
      }
    }),

    experimentalCacheExpiry: rollupOptions.experimentalCacheExpiry,
    inlineDynamicImports: rollupOptions.inlineDynamicImports,
    shimMissingExports: rollupOptions.shimMissingExports,
    strictDeprecations: rollupOptions.strictDeprecations,
    preserveSymlinks: rollupOptions.preserveSymlinks,
    preserveModules: rollupOptions.preserveModules,
    manualChunks: rollupOptions.manualChunks,
    treeshake: rollupOptions.treeshake,
    context: rollupOptions.context,

    external: toArray(params.data.$external).concat(toArray(rollupOptions.external))
      .concat(toArray(options.external ? Object.keys(options.external) : [])),

    plugins: [{
      name: 'tarima-packer',
      resolveId(importee) {
        if (!/^[@\w](?!.*(:\/\/))/.test(importee) || includes.some(x => importee.includes(x))) {
          return null;
        }

        const resolved = resolveDeps(importee, params);

        if (resolved) {
          return {
            id: resolved,
            external: true,
            isExternal: true,
          };
        }

        return null;
      },
      load() {
        return null;
      },
    }].concat(loadPlugins(rollupOptions.plugins || [], rollupOptions), getDynamicPlugin(rollupOptions, options, params)),
  };
}

// FIXME: invoke the CLI(or-cli-like-module) but use this as plugin/loader?
module.exports = (options, params, done) => {
  options = options || {};

  const rollupOptions = merge({}, options.rollup || {});
  const config = getDefaultsFrom(rollupOptions, options, params);

  /* eslint-disable global-require */
  Rollup = Rollup || require('rollup');

  Rollup.rollup(config).then(bundle => {
    bundle.watchFiles.forEach(dep => {
      if (params.filename !== dep) {
        params.deps.push(dep);
      }
    });

    const bundleName = typeof params.data.$bundle === 'string'
      ? params.data.$bundle
      : rollupOptions.bundle || 'main';

    const outputOptions = {
      strict: false,
      name: bundleName,
      sourcemap: options.sourceMaps || options.compileDebug,
      format: params.data.$format || rollupOptions.format || 'iife',
      globals: merge({}, params.data.$globals, rollupOptions.globals),
    };

    return bundle.generate(outputOptions).then(results => {
      // reset due output could be all chunks
      params._bundle = bundle;
      params._chunks = [];

      params.source = null;
      params.sourceMap = null;

      results.output.forEach(result => {
        if (result.isEntry) {
          params.source = result.code;
          params.sourceMap = result.map;
        } else if (!result.isAsset) {
          params._chunks.push({
            name: result.fileName,
            code: result.code,
            map: result.map,
          });
        }
      });

      done();
    });
  }).catch(done);
};

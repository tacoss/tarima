'use strict';

const $ = require('./utils');

const path = require('path');

// initialize meta-bundler
const tarima = require('../../lib');

const plugableSupportAPI = require('./hooks');
const cacheableSupportAPI = require('./caching');

// /* eslint-disable import/no-unresolved */
let cssCompressor;
let jsCompressor;

function prune(object) {
  if (!object || typeof object !== 'object') {
    return object;
  }

  if (Array.isArray(object)) {
    return object.map(prune);
  }

  const copy = {};

  Object.keys(object).forEach(key => {
    if (key.charAt() !== '_') {
      copy[key] = prune(object[key]);
    }
  });

  return copy;
}

let ctx;

function initContext(options) {
  let _level;

  _level = (options.flags.verbose && 'verbose') || (options.flags.debug ? 'debug' : 'info');
  _level = (options.flags.quiet && !options.flags.version && !options.flags.help) ? false : _level;

  const logger = require('log-pose').setLevel(_level).getLogger(12, process.stdout, process.stderr);

  ctx = plugableSupportAPI(logger, options);

  ctx.cache = cacheableSupportAPI(options.cacheFile);
  ctx.match = $.makeFilter(false, Array.isArray(options.filter)
    ? options.filter
    : ['**']);

  ctx.logger = logger;
  ctx.started = true;
  ctx.tarimaOptions = {};
  ctx.tarimaOptions.cwd = options.cwd;

  Object.keys(options.bundleOptions).forEach(key => {
    ctx.tarimaOptions[key] = options.bundleOptions[key];
  });

  let fixedBundle = $.toArray(options.bundle);

  ctx.isBundle = () => false;
  ctx._cache = null;
  ctx._data = [];

  options.bundleOptions.cache = ctx.cache.all() || {};

  // built-in helpers
  options.bundleOptions.helpers.destFile = id => $.read(path.join(options.dest, id));
  options.bundleOptions.helpers.resources = () => (options.bundleOptions.resources || []).join('\n');

  /* eslint-disable prefer-rest-params */
  /* eslint-disable prefer-spread */

  options.bundleOptions.helpers.includeTag = function _include() {
    return Array.prototype.slice.call(arguments)
      .map(src => {
        if (String(src).indexOf('.css') > -1) {
          return `<link rel="stylesheet" href="${src}">`;
        }

        if (String(src).indexOf('.js') > -1) {
          return `<script src="${src}"></script>`;
        }

        throw new Error(`Unsupported source for <@include>: ${src}`);
      })
      .join('\n');
  };

  if ($.isFile(options.rollupFile)) {
    /* eslint-disable global-require */
    $.merge(options.bundleOptions.rollup, require(path.resolve(options.rollupFile)));
  }

  if (options.bundleOptions.entryCache) {
    ctx._cache = {};
  }

  for (let i = 0, c = fixedBundle.length; i < c; i += 1) {
    if (fixedBundle[i] === true) {
      ctx.isBundle = () => true;
      fixedBundle = [];
      break;
    }

    if (!fixedBundle[i]) {
      fixedBundle.splice(i, 1);
    }
  }

  if (fixedBundle.length) {
    ctx.isBundle = $.makeFilter(true, fixedBundle);
  }

  // custom events
  ctx.onWrite = ctx.emit.bind(null, 'write');
  ctx.onDelete = ctx.emit.bind(null, 'delete');

  ctx.ensureRename = view => {
    if (typeof options.rename === 'function') {
      options.rename(view);
    }
  };

  ctx.ensureWrite = (view, index) =>
    Promise.resolve()
      .then(() => ctx.onWrite(view, index))
      .then(() => {
        if (options.bundleOptions.optimizations) {
          const sourceMaps = Boolean(options.bundleOptions.compileDebug && view.sourceMap);

          if (view.dest.indexOf('.css') > -1) {
            cssCompressor = cssCompressor || require('csso').minify;

            view.output = cssCompressor(view.output, {
              filename: view.dest,
              sourceMap: sourceMaps,
            }).css;
          }

          if (view.dest.indexOf('.js') > -1) {
            jsCompressor = jsCompressor || require('google-closure-compiler-js').compile;

            view.output = jsCompressor({
              jsCode: [{ src: view.output }],
              languageIn: 'ECMASCRIPT6',
              languageOut: 'ECMASCRIPT5',
              compilationLevel: 'ADVANCED',
              warningLevel: 'VERBOSE',
              env: 'CUSTOM',
              createSourceMap: sourceMaps,
              applyInputSourceMaps: sourceMaps,
            }).compiledCode;
          }
        }

        if (options.bundleOptions.sourceMapFiles === true && view.sourceMap) {
          $.write(`${view.dest}.map`, JSON.stringify(view.sourceMap));
        }

        $.write(view.dest, view.output);
      });

  ctx.dest = (id, ext) => {
    return path.relative(options.cwd, path.join(options.dest, ext
      ? id.replace(/\.[\w.]+$/, `.${ext}`)
      : id));
  };

  let _timeout;

  ctx.sync = (id, resolve) => {
    const entry = ctx.cache.get(id) || {};

    entry.mtime = $.mtime(id);

    delete entry.dirty;

    if (resolve) {
      resolve(entry);
    }

    ctx.cache.set(id, entry);

    clearTimeout(_timeout);

    // delay a bit
    _timeout = setTimeout(() => {
      ctx.cache.save();
    }, 100);
  };

  ctx.copy = target => {
    const entry = ctx.cache.get(target.src);

    if ((entry && entry.deleted) || !$.exists(target.src)) {
      target.type = 'delete';
      ctx.dist(target);
      return;
    }

    ctx._data.push(target.dest);

    target.type = 'copy';

    ctx.sync(target.src);
    ctx.dist(target);
  };

  ctx.track = (src, sub) => {
    ctx.sync(src, entry => {
      entry.deps = entry.deps || [];

      (sub || []).forEach(dep => {
        ctx.sync(dep, _entry => {
          _entry.deps = _entry.deps || [];

          if (_entry.deps.indexOf(src) === -1) {
            _entry.deps.push(src);
          }
        });
      });
    });
  };

  ctx._bundle = null;
  ctx._cache = null;

  ctx.compile = (src, cb) => {
    const entry = ctx.cache.get(src) || {};
    const opts = ctx.tarimaOptions;

    let partial;

    try {
      opts._bundle = ctx._bundle;
      opts._cache = ctx._cache;
      partial = tarima.load(path.resolve(options.cwd, src), opts);
    } catch (e) {
      return cb(e);
    }

    const _method = (partial.params.data.$bundle || ctx.isBundle(src)) ? 'bundle' : 'render';
    const _bundler = partial.params.data.$bundler || opts.bundler || 'rollup';
    const _prefix = partial.params.isScript && _method === 'bundle'
      ? _bundler
      : _method;

    return logger(_prefix, src, end =>
      partial[_method]((err, output) => {
        if (err) {
          end(src, _method, 'failure');
          return cb($.decorateError(err, partial.params));
        }

        // cached for later
        if (options.bundleOptions.bundleCache && _bundler === 'rollup') {
          ctx._bundle = output._bundle || ctx._bundle;
        }

        const file = path.relative(options.cwd, output.filename);
        const target = ctx.dest(file, output.extension);
        const index = ctx.track.bind(null, file);

        const result = {
          src: file,
          dest: target,
        };

        ctx.ensureRename(result);
        ctx._data.push(result.dest);

        result.output = output.source;
        result.sourceMap = output.sourceMap;

        // TODO: only track partials (?)
        const fixedDeps = entry.deps || [];

        output.deps.forEach(id => {
          if (id.indexOf(options.cwd) !== 0) {
            return;
          }

          const dep = path.relative(options.cwd, id);

          if ((file.split('/')[0] === dep.split('/')[0])
            && fixedDeps.indexOf(dep) === -1) {
            fixedDeps.push(dep);
          }
        });

        index(fixedDeps);
        ctx.ensureWrite(result, index)
          .then(() => {
            ctx.cache.set(file, 'deps', fixedDeps);
            ctx.cache.set(file, 'dest', result.dest);
            ctx.cache.set(file, 'data', prune(output.data));

            delete result.output;

            end(result.dest);
            cb();
          })
          .catch(cb);
      }));
  };
}

module.exports = (data, options, callback) => {
  if (!ctx) {
    initContext(options);
  }

  Promise.resolve()
    .then(() => {
      if (!data.dest) {
        return new Promise((resolve, reject) => {
          ctx.compile(data.src, err => {
            if (err) {
              reject(err);
            } else {
              resolve();
            }
          });
        });
      }

      ctx.copy(data);
    })
    .then(() => {
      callback(null, ctx._data);
    })
    .catch(e => {
      callback(e);
    });
};

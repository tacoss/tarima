'use strict';

const path = require('path');
const $ = require('./utils');

// initialize meta-bundler
const tarima = require('../../lib');
const preFilter = require('../../lib/helpers/pre-filter');

const plugableSupportAPI = require('./hooks');
const cacheableSupportAPI = require('./caching');

// /* eslint-disable import/no-unresolved */
let htmlCompressor;
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

module.exports.init = options => {
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
  ctx.tarimaOptions.public = options.public;

  Object.keys(options.bundleOptions).forEach(key => {
    ctx.tarimaOptions[key] = options.bundleOptions[key];
  });

  let fixedBundle = $.toArray(options.bundle);

  ctx.isBundle = () => false;
  ctx._bundle = null;
  ctx._cache = null;
  ctx._data = [];

  options.bundleOptions.cache = ctx.cache.all() || {};

  // built-in helpers
  options.bundleOptions.helpers.srcFile = _ => $.read(path.join(options.cwd, _.src));
  options.bundleOptions.helpers.destFile = _ => $.read(path.join(options.output, _.src));
  options.bundleOptions.helpers.resources = () => (options.bundleOptions.resources || []).join('\n');

  /* eslint-disable prefer-rest-params */
  /* eslint-disable prefer-spread */

  options.bundleOptions.helpers.includeTag = function _include(_) {
    return (typeof _.src === 'string' ? _.src.split(/[\s|;,]+/) : _.src)
      .map(src => {
        if (src.indexOf(':') === -1 && !$.exists(path.join(options.output, src))) {
          if (_.required) throw new Error(`Required source to include: ${src}`);
          return;
        }

        if (String(src).indexOf('.css') > -1) {
          return `<link rel="stylesheet" href="${src}">`;
        }

        if (String(src).indexOf('.js') > -1) {
          return `<script src="${src}"></script>`;
        }

        throw new Error(`Unsupported source to include: ${src}`);
      })
      .filter(Boolean)
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

  // pre-compile regex to reuse on all replacements!
  if (!options.bundleOptions.helpers._regex) {
    const keys = Object.keys(options.bundleOptions.helpers);

    Object.defineProperty(options.bundleOptions.helpers, '_regex', {
      value: new RegExp(`<(${keys.join('|')})([^<>]*?)(?:\\/>|>([^<>]*?)<\\/\\1>)`, 'g'),
    });
  }

  function ensureRename(view) {
    if (typeof options.rename === 'function') {
      options.rename(view);
    }
  }

  ctx.ensureWrite = (view, index, params) =>
    Promise.resolve()
      .then(() => ctx.onWrite(view, index))
      .then(() => {
        if (options.bundleOptions.sourceMapFiles === true && view.sourceMap) {
          $.write(`${view.dest}.map`, JSON.stringify(view.sourceMap));
        }

        $.write(view.dest, view.output);
      });

  ctx.dest = (id, ext) => {
    return path.relative(options.cwd, path.join(options.output, ext
      ? id.replace(/\.[\w.]+$/, `.${ext}`)
      : id));
  };

  ctx.sync = (id, resolve) => {
    const entry = ctx.cache.get(id) || {};

    entry.dirty = false;

    if (resolve) {
      resolve(entry);
    }
  };

  ctx.copy = target => {
    const entry = ctx.cache.get(target.src);

    if ((entry && entry.deleted) || !$.exists(target.src)) {
      target.type = 'delete';
      ctx.dist(target);
      return;
    }

    ctx._data.push(target.dest);

    target.type = target.data ? 'write' : 'copy';

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

          ctx.cache.set(dep, _entry);
        });
      });
    });
  };

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

    // preset bundles through extensions, matching or inline data
    const _method = (partial.params.parts.includes('bundle') || partial.params.data.$bundle || ctx.isBundle(src))
      ? 'bundle'
      : 'render';

    return logger(_method, src, end =>
      partial[_method]((err, output) => {
        if (err) {
          end(src, _method, 'failure');
          return cb($.decorateError(err, partial.params));
        }

        // cached for later
        if (options.bundleOptions.bundleCache) {
          ctx._bundle = output._bundle || ctx._bundle;
        }

        const file = path.relative(options.cwd, output.filename);
        const target = ctx.dest(file, output.extension);
        const index = ctx.track.bind(null, file);
        const tasks = [];

        const result = {
          src: file,
          dest: target,
        };

        ensureRename(result);

        if (output._chunks) {
          output._chunks.forEach(chunk => {
            tasks.push(() => {
              const sub = {
                dest: path.resolve(result.dest, '..', path.basename(chunk.filename)),
                data: chunk.source,
                type: 'write',
              };

              ensureRename(sub);
              ctx._data.push(sub.dest);
              ctx.dist(sub);
            });
          });
        }

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
        ctx.ensureWrite(result, index, partial.params.data)
          .then(() => tasks.map(x => x()))
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
};

module.exports.run = (target, options, callback) => {
  Promise.resolve()
    .then(() => {
      if (!target.dest) {
        return new Promise((resolve, reject) => {
          ctx.compile(target.src, err => {
            if (err) {
              reject(err);
            } else {
              resolve();
            }
          });
        });
      }

      // run pre-filter on allowed extensions only!
      const allow = options.bundleOptions.process || [];
      const ext = path.extname(target.src).replace('.', '');

      if (allow.includes(ext)) {
        target.data = preFilter($.read(target.src).toString(), options.bundleOptions.globals);
      }

      ctx.copy(target);
    })
    .then(() => {
      callback(null, ctx._data, ctx.cache.get(target.src) || {});
    })
    .catch(e => {
      callback(e);
    });
};

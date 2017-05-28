'use strict';

const debug = require('debug')('tarima:compile');

const $ = require('./utils');

const path = require('path');
const Promise = require('es6-promise');

const support = require('../../lib/support');

const prefix = 'data:application/json;charset=utf-8;base64,';

const styleRe = /\.(?:css|styl|less|s[ac]ss)(?=>(?:\.\w+)*|$)$/;
const scriptRe = /\.(?:[tj]sx?|es6|(?:lit)?coffee(?:\.md)?|marko|svelte|[rs]v|ract|vue)(?=>(?:\.\w+)*|$)$/;

/* eslint-disable import/no-unresolved */
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

function toUrl(sourceMap) {
  return prefix + new Buffer(JSON.stringify(sourceMap)).toString('base64');
}

module.exports = function _compile(tarima, files, cb) {
  const data = [];
  const tasks = [];

  const cache = this.cache;
  const state = this.state;
  const options = this.opts;

  const dist = this.dist;
  const match = this.match;
  const logger = this.logger;
  const dispatch = this.dispatch;

  options.bundleOptions.cache = cache.all() || {};

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

  if ($.isFile(this.opts.rollupFile)) {
    /* eslint-disable global-require */
    $.merge(options.bundleOptions.rollup, require(path.resolve(this.opts.rollupFile)));
  }

  function tarimaOptions() {
    const params = {};

    params.cwd = options.cwd;

    Object.keys(options.bundleOptions).forEach(key => {
      params[key] = options.bundleOptions[key];
    });

    return params;
  }

  let fixedBundle = $.toArray(options.bundle);

  let isBundle = () => false;

  let _cache;
  let _bundle;

  if (options.bundleOptions.entryCache) {
    _cache = {};
  }

  for (let i = 0, c = fixedBundle.length; i < c; i++) {
    if (fixedBundle[i] === true) {
      fixedBundle = [];

      isBundle = () => true;

      break;
    }

    if (!fixedBundle[i]) {
      fixedBundle.splice(i, 1);
    }
  }

  if (fixedBundle.length) {
    isBundle = $.makeFilter(true, fixedBundle);
  }

  // custom events
  const onWrite = this.emit.bind(null, 'write');
  const onDelete = this.emit.bind(null, 'delete');

  function ensureRename(view) {
    if (typeof options.rename === 'function') {
      options.rename(view);
    }
  }

  function ensureWrite(view, index) {
    onWrite(view, index);

    if (options.bundleOptions.compileDebug && view.sourceMap) {
      // TODO: normalize sourceMap

      delete view.sourceMap.sourceRoot;
      delete view.sourceMap.sourcesContent;

      view.sourceMap.file = view.dest;
      view.sourceMap.sources = (view.sourceMap.sources || [view.src])
        .map(src => path.relative(options.cwd, src));

      if (!view.sourceMap.sources[0]) {
        view.sourceMap.sources[0] = view.src;
      }

      view.sourceMap.sourcesContent = view.sourceMap.sources
        .map(src => $.read(src).toString());

      if (options.bundleOptions.sourceMapFile === true) {
        $.write(`${view.dest}.map`, JSON.stringify(view.sourceMap));
      }

      const _prefix = view.dest.indexOf('.js') > -1 ? '//' : '/*';
      const _suffix = view.dest.indexOf('.js') > -1 ? '' : ' */';

      view.output += `\n${_prefix}# sourceMappingURL=${
        (options.bundleOptions.sourceMapFile
          ? `${path.basename(view.dest)}.map`
          : toUrl(view.sourceMap))
      }${_suffix}`;
    }

    if (options.bundleOptions.optimize) {
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

    $.write(view.dest, view.output);
  }

  function dest(id, ext) {
    return path.relative(options.cwd, path.join(options.dest, ext
      ? id.replace(/\.[\w.]+$/, `.${ext}`)
      : id));
  }

  function sync(id, resolve) {
    const entry = cache.get(id) || {};

    entry.mtime = $.mtime(id);

    delete entry.dirty;

    if (resolve) {
      resolve(entry);
    }

    cache.set(id, entry);
  }

  function copy(src) {
    return () => {
      const out = [];

      return Promise.all(src.map(target => {
        const entry = cache.get(target.src);

        if ((entry && entry.deleted) || !$.exists(target.src)) {
          target.type = 'delete';
          dist(target);
          return null;
        }

        return logger('copy', target, () => {
          sync(target.src);

          out.push(target.dest);
          entry.dest = target.dest;

          $.copy(target.src, target.dest);
        });
      }))
      .then(() => data.push(out));
    };
  }

  function track(src, sub) {
    sync(src, entry => {
      entry.deps = entry.deps || [];

      (sub || []).forEach(dep => {
        sync(dep, _entry => {
          _entry.deps = _entry.deps || [];

          if (_entry.deps.indexOf(src) === -1) {
            _entry.deps.push(src);
          }
        });
      });
    });
  }

  function append(src, next) {
    const entry = cache.get(src);

    if (entry.dirty === false) {
      delete entry.dirty;
    }

    if (entry.dirty) {
      next(src);
    }
  }

  function compile(src) {
    const entry = cache.get(src) || {};

    // override
    entry.main = true;

    if (entry.deleted) {
      dist({
        src,
        type: 'delete',
        dest: entry.dest,
      });

      cache.rm(src);
      onDelete(src, entry);
    } else {
      // append all sources
      let ascDesc = src.split('/').length * -1;

      if (styleRe.test(src)) {
        ascDesc = 2;
      }

      if (scriptRe.test(src)) {
        ascDesc = 1;
      }

      tasks.push({
        _offset: ascDesc,
        run: next => {
          const opts = tarimaOptions();

          let partial;

          try {
            opts._bundle = _bundle;
            opts._cache = _cache;
            partial = tarima.load(path.resolve(options.cwd, src), opts);
          } catch (e) {
            return next(e);
          }

          const _method = (partial.params.data.$bundle || isBundle(src)) ? 'bundle' : 'render';
          const _bundler = partial.params.data.$bundler || opts.bundler || 'rollup';

          const file = path.relative(options.cwd, partial.params.filename);
          const target = dest(file, partial.params.extension);

          const result = {
            src: file,
            dest: target,
          };

          return logger(_method, result.src, () => {
            partial[_method]((err, output) => {
              if (err) {
                return next(err);
              }

              // cached for later
              if (options.bundleOptions.bundleCache && _bundler === 'rollup') {
                _bundle = output._bundle || _bundle;
              }

              const index = track.bind(null, file);

              ensureRename(result);

              data.push(result.dest);

              result.sourceMap = output.sourceMap;
              result.output = output.source;

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
              ensureWrite(result, index);

              cache.set(file, 'deps', fixedDeps);
              cache.set(file, 'dest', result.dest);
              cache.set(file, 'data', prune(output.data));

              delete result.output;

              next();
            });
          });
        },
      });
    }
  }

  const seen = {};
  const unknown = [];

  const watchers = !Array.isArray(options.watch)
    ? [options.watch]
    : options.watch;

  const watching = file => {
    for (let i = 0, c = watchers.length; i < c; i += 1) {
      if (file.indexOf(watchers[i]) === 0) {
        return true;
      }
    }
  };

  debug('Processing %s files', files.length);

  files.forEach(src => {
    // skip early
    if (watching(src)) {
      debug('WATCH %s', src);
      return;
    }

    const entry = cache.get(src);

    if (!entry) {
      // required reference
      cache.set(src, { dirty: true });
    }

    if (!support.isSupported(src)) {
      return append(src, id => {
        if (match(src)) {
          debug('OK %s', id);

          seen[id] = 1;
          unknown.push(id);
        } else {
          debug('SKIP %s', id);
        }
      });
    }

    if (_cache && entry && entry.dirty) {
      delete _cache[src];
    }

    if (!seen[src]) {
      debug('ADD %s', src);
      seen[src] = true;

      if (match(src)) {
        append(src, compile);
      } else {
        debug('NOMATCH %s', src);
      }
    } else {
      debug('SEEN %s', src);
    }
  });

  if (unknown.length) {
    dispatch(unknown.map(file => {
      const _target = {
        src: file,
        dest: dest(file),
      };

      ensureRename(_target);

      return _target;
    }), (src, run) => {
      (src.length ? [copy(src)] : [])
        .concat(run)
        .forEach(_cb => tasks.push({
          _offset: 3,
          run: _cb,
        }));
    });
  }

  function _end(err) {
    // reset
    _cache = null;
    _bundle = null;

    try {
      cb(err, {
        cache: cache.all(),
        input: Object.keys(seen),
        output: $.flatten(data),
      });
    } catch (e) {
      console.log('!', e.stack);
    }
  }

  tasks
  .sort((a, b) => b._offset - a._offset)
  .reduce((a, b) => {
    return a.then(() => {
      if (state('abort')) {
        return;
      }

      return new Promise((resolve, reject) => {
        b.run((err, _files) => {
          if (err) {
            reject(err);
          } else {
            resolve();
            data.push(_files);
          }
        });
      });
    });
  }, Promise.resolve())
    .then(() => {
      if (state('abort')) {
        logger.printf('\r\r{gray.diff|The build was stopped}\n');
      }

      _end();
    })
    .catch(_end);
};

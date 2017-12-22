'use strict';

const debug = require('debug')('tarima:compile');

const $ = require('./utils');

const path = require('path');

const support = require('../../lib/support');

const workerFarm = require('worker-farm');

const workers = workerFarm(require.resolve('./_compiler'));

module.exports = function _compile(tarima, files, cb) {
  const tasks = [];

  const cache = this.cache;
  const match = this.match;
  const options = this.opts;

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
    tasks.push({ src });
  }

  function dest(id, ext) {
    return path.relative(options.cwd, path.join(options.dest, ext
      ? id.replace(/\.[\w.]+$/, `.${ext}`)
      : id));
  }

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

    if (!seen[src]) {
      seen[src] = true;

      if (match(src)) {
        debug('ADD %s', src);
        append(src, compile);
      } else {
        debug('SKIP %s', src);
      }
    } else {
      debug('SEEN %s', src);
    }
  });

  if (unknown.length) {
    unknown.forEach(file => {
      const _target = {
        src: file,
        dest: dest(file),
      };

      if (typeof options.rename === 'function') {
        options.rename(_target);
      }

      tasks.push(_target);
    });
  }

  function _end(err, output) {
    cb(err, {
      files,
      output,
      cache: cache.all(),
      input: Object.keys(seen),
    });
  }

  Promise.all(tasks.map(data => new Promise((resolve, reject) => {
    workers(data, options, (err, result) => {
      if (err) {
        reject(err);
      } else {
        resolve(result);
      }
    });
  })))
    .then(result => {
      _end(null, result.filter(Boolean));
    })
    .catch(_end);
};

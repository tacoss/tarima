'use strict';

const debug = require('debug')('tarima:compile');

const path = require('path');

const _worker = require('./_worker');
const support = require('../../lib/support');

module.exports = (context, files, cb) => {
  const tasks = [];

  const dispatch = context.dispatch;
  const copy = context.copy;
  const cache = context.cache;
  const match = context.match;
  const options = context.opts;

  if (!_worker.shared) {
    _worker.shared = _worker.init(options);
  }

  const onDelete = context.emit.bind(null, 'delete');

  const seen = {};
  const unknown = [];

  const watchers = !Array.isArray(options.watching)
    ? [options.watching]
    : options.watching;

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
    const entry = cache.get(src) || {};

    // override
    entry.main = true;

    if (entry.deleted) {
      context.dist({
        src,
        type: 'delete',
        dest: entry.dest,
      });

      cache.rm(src);
      onDelete(src, entry);
    } else {
      tasks.push({ src });
    }
  }

  function dest(id, ext) {
    return path.relative(options.cwd, path.join(options.output, ext
      ? id.replace(/\.[\w.]+$/, `.${ext}`)
      : id));
  }

  files.sort((a, b) => {
    if (support.isResource(a)) return -1;
    if (support.isResource(b)) return 1;
    return 0;
  }).forEach(src => {
    // skip early
    if (watching(src) || copy(src)) {
      debug('WATCH %s', src);
      return;
    }

    const fixed = src.replace(/^(\.{2,3}\/)+/, '@');
    const entry = cache.get(src);

    if (!entry) {
      // required reference
      cache.set(src, { dirty: true });
    }

    if (!support.isSupported(src)) {
      return append(src, id => {
        if (match(fixed)) {
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

      if (match(fixed)) {
        debug('ADD %s', src);
        append(src, compile);
      } else {
        debug('SKIP %s', src);
      }
    } else {
      debug('SEEN %s', src);
    }
  });

  const _subtasks = [];
  const _files = [];

  if (unknown.length) {
    dispatch(options, unknown.map(file => {
      const _target = {
        src: file,
        dest: dest(file),
      };

      return _target;
    }), (result, next) => {
      Array.prototype.push.apply(tasks, result.map(x => {
        if (typeof options.rename === 'function') {
          options.rename(x);
        }
        return x;
      }));

      _subtasks.push(next((err, _result) => {
        if (!err) {
          Array.prototype.push.apply(_files, _result.map(x => x.dest));
        }
      }));
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

  Promise.all(_subtasks)
    .then(() => {
      return tasks.map(task => () => new Promise((resolve, reject) => {
        _worker.run(task, options, (err, result, caching) => {
          if (err) {
            reject(err);
          } else {
            cache.set(task.src, caching);
            cache.set(task.src, 'dirty', false);

            (caching.deps || []).forEach(dep => {
              const parent = cache.get(dep) || {};
              const deps = parent.deps || [];

              cache.set(dep, 'dirty', false);

              if (deps.indexOf(task.src) === -1) {
                deps.push(task.src);
                cache.set(dep, 'deps', deps);
              }
            });

            result.forEach(x => {
              if (_files.indexOf(x) === -1) {
                _files.push(x);
              }
            });

            resolve();
          }
        });
      }))
        .reduce((prev, cur) => prev.then(() => cur()), Promise.resolve());
    })
    .then(() => _end(null, _files)).catch(e => _end(e, _files));
};

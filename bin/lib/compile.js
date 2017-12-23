'use strict';

const debug = require('debug')('tarima:compile');

const path = require('path');

const _compiler = require('./_compiler');
const support = require('../../lib/support');

const RE_STYLES = /\.(?:css|styl|less|s[ac]ss)(?=>(?:\.\w+)*|$)$/;
const RE_SCRIPTS = /\.(?:[tj]sx?|es6|(?:lit)?coffee(?:\.md)?|marko|svelte|[rs]v|ract|vue)(?=>(?:\.\w+)*|$)$/;

module.exports = (context, files, cb) => {
  const tasks = [];

  const cache = context.cache;
  const match = context.match;
  const options = context.opts;

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
      let ascDesc = src.split('/').length * -1;

      if (RE_STYLES.test(src)) {
        ascDesc = 2;
      }

      if (RE_SCRIPTS.test(src)) {
        ascDesc = 1;
      }

      tasks.push({ src, _offset: ascDesc });
    }
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
        _offset: 3,
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

  const _workers = [];
  const _files = [];

  Promise.all(tasks
    .sort((a, b) => b._offset - a._offset)
    .map(task => new Promise((resolve, reject) => {
      const _worker = _compiler.getShared(options);

      _workers.push(_worker);

      _worker.run(task, options, (err, result) => {
        if (err) {
          reject(err);
        } else {
          result.forEach(x => {
            if (_files.indexOf(x) === -1) {
              _files.push(x);
            }
          });

          resolve();
        }
      });
    })))
    .then(() => {
      if (!options.watch) {
        _workers.forEach(x => {
          x.end();
        });
      }

      _end(null, _files);
    })
    .catch(e => {
      _end(e, _files);
    });
};

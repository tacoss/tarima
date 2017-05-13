'use strict';

/* eslint-disable import/no-unresolved */
/* eslint-disable global-require */

const $ = require('./utils');

const glob = require('glob');

let chokidar;

function sync(id, src, cache) {
  const entry = cache.get(id) || {};

  if (!$.exists(id)) {
    entry.deleted = true;
  }

  entry.dirty = true;

  if (entry.id) {
    cache.each((dep, _id) => {
      if (!dep.id) {
        return;
      }

      if (dep.dest === entry.dest) {
        dep.dirty = true;

        if (src.indexOf(_id) === -1) {
          src.push(_id);
        }
      }
    });
  }

  if (entry.deps) {
    entry.deps.forEach(dep => {
      const _entry = cache.get(dep);

      if (_entry && _entry.main) {
        _entry.dirty = true;

        if (src.indexOf(dep) === -1) {
          src.push(dep);
        }
      }
    });
  }
}

function watch(cb) {
  chokidar = chokidar || require('chokidar');

  const cache = this.cache;
  const options = this.opts;

  let timeout;
  let src = [];

  function next(err) {
    cb(err, src);
    src = [];
  }

  function add(file) {
    if (src.indexOf(file) === -1) {
      src.push(file);
      sync(file, src, cache);
    }

    clearTimeout(timeout);
    timeout = setTimeout(next.bind(this), options.interval || 200);
  }

  chokidar.watch(options.src, {
    cwd: options.cwd,
    ignored: options.ignore,
    persistent: true,
    ignoreInitial: true,
    ignorePermissionErrors: true,
    followSymlinks: options.followSymlinks,
  })
  .on('all', (evt, file) => {
    if (evt === 'add' || evt === 'change' || evt === 'unlink') {
      add.call(this, file);
    }
  })
  .on('error', e => next.call(this, e))
  .add(options.watch);
}

module.exports = function _read(cb) {
  const self = this;

  let files = [];

  try {
    files = glob.sync(this.opts.src, {
      dot: true,
      nodir: true,
      nosort: true,
      cwd: this.opts.cwd,
      ignore: this.opts.ignore,
    });
  } catch (e) {
    return cb(e);
  }

  if (self.opts.flags.dev === true) {
    watch.call(self, cb);
  }

  files.forEach(file => {
    const entry = self.cache.get(file);

    if (!entry) {
      return;
    }

    if (!$.exists(file)) {
      entry.deleted = true;
      return;
    }

    if (entry.mtime && ($.mtime(file) > entry.mtime)) {
      sync(file, files, self.cache);
    }

    entry.dirty = (self.opts.force === true)
      || (entry.deleted || entry.dirty || !entry.mtime);
  });

  cb(undefined, files);
};

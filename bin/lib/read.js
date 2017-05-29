'use strict';

/* eslint-disable import/no-unresolved */
/* eslint-disable global-require */

const debug = require('debug')('tarima:read');

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

  try {
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
        debug(`${evt} ${file}`);
        add.call(this, file);
      }
    })
    .on('error', e => next.call(this, e))
    .add(options.watch);
  } catch (e) {
    next.call(this, e);
  }
}

module.exports = function _read(cb) {
  if (!this.opts.src.length) {
    return cb(new Error(`Missing sources, given '${this.opts.src}'`));
  }

  const filter = this.opts.src.length > 1
    ? `{${this.opts.src}}/**`
    : `${this.opts.src}/**`;

  const self = this;

  let files = [];

  debug(filter);

  try {
    files = glob.sync(filter, {
      dot: true,
      nodir: true,
      nosort: true,
      cwd: this.opts.cwd,
      ignore: this.opts.ignore,
    });
  } catch (e) {
    return cb(e);
  }

  process.nextTick(() => {
    if (self.opts.flags.env === 'development') {
      watch.call(self, cb);
    }
  });

  cb(undefined, files.filter(file => {
    const entry = self.cache.get(file);

    if (!entry || self.opts.flags.force === true) {
      return true;
    }

    if (!$.exists(file)) {
      entry.dirty = false;
      entry.deleted = true;
      return false;
    }

    if (entry.mtime && ($.mtime(file) > entry.mtime)) {
      sync(file, files, self.cache);
    }

    return true;
  }));
};

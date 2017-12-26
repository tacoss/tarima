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

function watch(context, cb) {
  chokidar = chokidar || require('chokidar');

  const cache = context.cache;
  const options = context.opts;

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
    timeout = setTimeout(next, options.interval || 200);
  }

  try {
    chokidar.watch(options.from, {
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
          add(file);
        }
      })
      .on('error', next)
      .add(options.watching);
  } catch (e) {
    next(e);
  }
}

module.exports = (context, cb) => {
  if (!context.opts.from.length) {
    return cb(new Error(`Missing sources, given '${context.opts.from}'`));
  }

  const filter = context.opts.from.length > 1
    ? `{${context.opts.from}}/**`
    : `${context.opts.from}/**`;

  let files = [];

  debug(filter);

  try {
    files = glob.sync(filter, {
      dot: true,
      nodir: true,
      nosort: true,
      cwd: context.opts.cwd,
      ignore: context.opts.ignore,
    });
  } catch (e) {
    return cb(e);
  }

  if (context.opts.watch === true) {
    try {
      watch(context, cb);
    } catch (e) {
      return cb(e);
    }
  }

  cb(undefined, files.filter(file => {
    const entry = context.cache.get(file);

    if (!entry || context.opts.force === true) {
      return true;
    }

    if (!$.exists(file)) {
      entry.dirty = false;
      entry.deleted = true;
      return false;
    }

    if (entry.mtime && ($.mtime(file) > entry.mtime)) {
      sync(file, files, context.cache);
    }

    return entry.dirty;
  }));
};

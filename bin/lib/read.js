'use strict';

/* eslint-disable import/no-unresolved */
/* eslint-disable global-require */

const debug = require('debug')('tarima:read');
const path = require('path');
const glob = require('glob');

const $ = require('./utils');

let nsfw;

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
  nsfw = nsfw || require('nsfw');

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

  function on(evt, skip) {
    const fullpath = path.join(evt.newDirectory || evt.directory, evt.newFile || evt.file);

    if ($.isFile(fullpath)) {
      let type = (evt.action === 1 || evt.action === 2)
        ? 'changed'
        : null;

      type = type || (evt.action === 0 ? 'add' : null);
      type = type || (evt.action === 3 ? 'unlink' : null);

      const file = path.relative(options.cwd, fullpath);

      type = (skip && skip(file)) ? 'ignore' : type;

      debug(`${type} ${file}`);

      if (type !== 'ignore') {
        add(file);
      }
    }
  }

  const isIgnore = (options.ignore && options.ignore.length)
    ? $.makeFilter(true, options.ignore)
    : false;

  const sources = options.from.concat(options.watching)
    .concat(Object.keys(options.copy));

  const opts = {
    debounceMS: 250,
    errorCallback: next,
  };

  const all = [];

  sources.forEach(dir => {
    const base = path.join(options.cwd, dir);

    all.push(nsfw(base, evts => {
      evts.forEach(evt => on(evt, isIgnore));
    }, opts).catch(e => {
      throw new Error(`Failed to watch '${dir}' source. ${e.message}`);
    }));
  });

  Promise.all(all).then(_all => {
    _all.forEach(x => x.start());
  }).catch(next);

  process.on('exit', () => {
    Promise.all(all).then(_all => {
      _all.forEach(x => x.stop());
    }).catch(next);
  });
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

'use strict';

const path = require('path');
const glob = require('glob');
const micromatch = require('micromatch');

const $ = require('./utils');
const readFiles = require('./read');
const compileFiles = require('./compile');

const plugableSupportAPI = require('./hooks');
const cacheableSupportAPI = require('./caching');

function makeReplacement(obj, test, rename) {
  return value => {
    const dir = obj.output || obj.cwd;
    const rel = value ? path.relative(dir, value) : path.relative(obj.cwd, dir);
    const ext = path.extname(rel);
    const ok = test(rel);

    if (ok) {
      // support for dynamic path slicing and rename strategy
      return path.join(dir, (rename || ok).replace(/\{(basedir|filepath|fullpath)(?:\/(.+?))?\}/, (_, type, match) => {
        const parts = type !== 'fullpath' ? path.dirname(rel).split('/') : rel.split('/');
        const keys = match ? match.split('/') : [];
        const _test = [];

        let h = 0;
        let j = 0;

        /* eslint-disable no-constant-condition */
        /* eslint-disable no-continue */
        while (true) {
          const a = parts[j];
          const b = keys[h];

          if (typeof a === 'undefined' && b) {
            break;
          }

          if (typeof b === 'undefined' && typeof a === 'undefined') {
            break;
          }

          if (/^\d+$/.test(b)) {
            parts.splice(j, +b);
            j = 0;
            h += 1;
            continue;
          }

          if (a === b) {
            h += 1;
            parts[j] = keys[h];
            h += 1;
            j += 1;
            continue;
          }

          _test.push(a);
          j += 1;
        }

        return _test.join('/');
      })
      // backward compat
        .replace('{filename}', path.basename(rel, ext))
        .replace('{extname}', ext.substr(1)))
        .replace('{fname}', path.basename(rel))
        .replace('{name}', path.basename(rel, ext))
        .replace('{ext}', ext.substr(1));
    }
  };
}

function complexFactor(test) {
  return test.split('/').length * test.split('**').length;
}

/* eslint-disable no-nested-ternary */
module.exports = (options, logger, done) => {
  if (!Array.isArray(options.bundle)) {
    options.bundle = options.bundle === true ? ['**'] : options.bundle ? [options.bundle] : [];
  }

  // normalize cwd
  options.cwd = typeof options.cwd === 'string'
    ? path.resolve(options.cwd)
    : process.cwd();

  // resolve all relative paths
  ['output', 'public', 'reloader', 'cacheFile', 'rollupFile'].forEach(subpath => {
    if (options[subpath]) {
      options[subpath] = Array.isArray(options[subpath])
        ? options[subpath].map(subdir => path.resolve(options.cwd, subdir))
        : path.resolve(options.cwd, options[subpath]);
    }
  });

  // normalize copy-patterns
  options.copy = options.copy !== null && typeof options.copy === 'object'
    ? options.copy
    : [];

  if (Array.isArray(options.copy)) {
    options.copy = options.copy.reduce((prev, cur) => {
      prev[cur] = '.';
      return prev;
    }, {});
  }

  const filters = Array.isArray(options.filter) ? options.filter : ['**'];
  const context = plugableSupportAPI(logger, options);

  options.ignore = options.ignore || [];
  options.locals = options.locals || {};
  options.rename = options.rename || [];

  // devPlugins works only on dev-mode
  options.plugins = options.plugins || [];
  options.devPlugins = options.devPlugins || [];

  // safe copies
  const paths = Object.keys(options.copy).map(key => ({
    target: options.copy[key],
    prefix: key,
  }));

  context.copy = (file, baseDir, isMatched) => {
    if (isMatched) {
      const srcFile = path.join(options.cwd, baseDir, file);
      const destFile = path.join(options.output, file);

      if (!$.exists(destFile) || ($.mtime(destFile) < $.mtime(srcFile))) {
        $.copy(srcFile, destFile);
      }
      return true;
    }

    for (let i = 0; i < paths.length; i += 1) {
      if (file.indexOf(paths[i].prefix) === 0) {
        const destFile = path.relative(paths[i].prefix, file);

        context.dist({
          src: path.join(options.cwd, file),
          dest: path.relative(options.cwd, path.join(options.output, paths[i].target, destFile)),
          type: 'copy',
        });
        return true;
      }
    }
  };

  Object.keys(options.copy).forEach(src => {
    logger.info('\r\r{% log Copying files from: %} {% yellow %s %}\n', src);

    let count = 0;

    $.toArray(options.copy[src]).forEach(sub => {
      glob.sync('**', { cwd: src, nodir: true }).every(x => {
        count += 1;

        const dest = path.join(sub, x);

        return context.copy(dest, src, true);
      });
    });

    logger.info('\r\r{% line.cyan %s file%s copied %}\n', count, count === 1 ? '' : 's');
  });

  // internally used
  context.cache = cacheableSupportAPI(options.cacheFile);
  context.match = $.makeFilter(false, filters);
  context.logger = logger;
  context.started = new Date();

  options.pluginOptions = options.pluginOptions || {};
  options.bundleOptions = options.bundleOptions || {};

  options.bundleOptions.locals = options.bundleOptions.locals || {};
  options.bundleOptions.globals = options.bundleOptions.globals || {};

  options.bundleOptions.rollup = options.bundleOptions.rollup || {};
  options.bundleOptions.helpers = options.bundleOptions.helpers || {};
  options.bundleOptions.resources = options.bundleOptions.resources || [];
  options.bundleOptions.extensions = options.bundleOptions.extensions || {};

  function push(filter) {
    const offset = filter.indexOf('/');

    if (offset === -1) {
      options.ignore.push(`**/${filter}`);

      if (filter.indexOf('.') === -1 && filter.indexOf('*') === -1) {
        options.ignore.push(`**/${filter}/**`);
        options.ignore.push(`${filter}/**`);
      }

      options.ignore.push(filter);
      return;
    }

    if (offset === 0) {
      filter = filter.substring(1);
    }

    if (filter.charAt(filter.length - 1) === '/') {
      options.ignore.push(filter.slice(0, -1));
      options.ignore.push(`${filter}**`);
    } else {
      options.ignore.push(filter);
    }
  }

  function die(error) {
    done.call(context, Array.isArray(error)
      ? error.map(err => err.toString()).join('\n')
      : error);
  }

  if (!$.exists(options.output)) {
    options.flags.force = true;
  }

  if (options.flags.force) {
    context.cache.reset();
  }

  let src = [];

  const plugs = () => Promise.all((options.plugins || [])
    // conditionally load devPlugins
    .concat((options.watch === true ? options.devPlugins || [] : [])
      .map(devFile => ({ dev: true, src: devFile })))
    .map(file => {
      if (typeof file !== 'object') {
        file = { src: file };
      }

      const testFile = path.resolve(file.src);

      file.fn = require($.isFile(testFile) ? testFile : file.src);

      return file;
    })
    .sort((a, b) => {
      // run dev-plugins at the end
      if (a.dev && !b.dev) {
        return 1;
      }

      if (!a.dev && b.dev) {
        return -1;
      }

      return b.fn.length - a.fn.length;
    })
    .map(task =>
      new Promise((resolve, reject) => {
        function next(e) {
          if (e) {
            reject(e);
          } else {
            resolve();
          }
        }

        // ES6 interop
        task.fn = task.fn.default || task.fn;

        try {
          if (task.fn.length) {
            task.fn.call(context, next);
          } else {
            task.fn.call(context);
            next();
          }
        } catch (e) {
          reject(e);
        }
      })));

  const opts = () => {
    if (options.ignore) {
      const ignores = options.ignore.slice();

      options.ignore = [];

      ignores.forEach(push);
    }

    if (options.ignoreFiles) {
      options.ignoreFiles.forEach(ifile => {
        if ($.isFile(ifile)) {
          const lines = $.read(ifile).toString().split('\n');

          lines.forEach(line => {
            if (line.length && (line[0] !== '#') && (options.ignore.indexOf(line) === -1)) {
              push(line);
            }
          });
        }
      });
    }

    if (options.rename) {
      const replaceOpts = $.toArray(options.rename).map(test => {
        if (typeof test === 'function') {
          return { cb: makeReplacement(options, test) };
        }

        if (typeof test === 'string') {
          test = test.split(':');
        }

        if (Array.isArray(test)) {
          const isRe = test[0] instanceof RegExp;
          const re = {};

          re[isRe ? 're' : 'str'] = test[0];

          if (!isRe) {
            test[0] = micromatch.makeRe(test[0], { dot: true });
          }

          re.cb = makeReplacement(options, RegExp.prototype.test.bind(test[0]), test[1]);

          return re;
        }

        return null;
      });

      // TODO: organize helpers...
      replaceOpts.sort((a, b) => {
        if (a.cb) {
          return b.cb ? 0 : b.re ? 1 : -1;
        }

        if (a.re) {
          return b.cb ? 1 : b.re ? 0 : -1;
        }

        return a.str && b.str ? complexFactor(b.str) - complexFactor(a.str) : 1;
      });

      options.rename = view => {
        Object.keys(replaceOpts).forEach(key => {
          view.dest = replaceOpts[key].cb(view.dest) || view.dest;
        });

        view.dest = path.relative(options.cwd, view.dest);
      };
    }
  };

  let close;
  let closing;
  let reloader;

  function runner(main, result) {
    if (context.started) {
      return main.call(context, result, options);
    }

    for (let i = 0; i < options.watching.length; i += 1) {
      for (let j = 0; j < result.files.length; j += 1) {
        if (result.files[j].indexOf(options.watching[i]) === 0) {
          return main.call(context, result, options);
        }
      }
    }
  }

  function end(err, result) {
    function _next() {
      if (!reloader && options.reloader) {
        reloader = options.reloader;

        if (typeof reloader === 'string') {
          logger.info('\r{% log Reloader: %} {% yellow %s %}\r\n', reloader);
          reloader = require(reloader);
        }
      }

      if (typeof reloader === 'function') {
        close = runner(reloader, result);
      }

      closing = false;

      context.cache.save();
      context.started = false;

      done.call(context, err, result);
      context.emit('end', err, result);
    }

    try {
      if (!closing && (result && !result.output.length)) {
        closing = true;

        if (typeof close === 'function') {
          if (close.length === 1) {
            close(_next);
          } else {
            close();
            _next();
          }
        } else {
          _next();
        }
      } else {
        _next();
      }
    } catch (e) {
      done.call(context, e, result);
      context.emit('end', e, result);
    }
  }

  function build(err) {
    if (!err) {
      try {
        compileFiles(context, src, end);
      } catch (e) {
        end(e);
      }
    } else {
      end(err);
    }
  }

  try {
    Promise.resolve()
      .then(() => plugs())
      .then(() => opts())
      .then(() =>
        readFiles(context, (err2, files) => {
          src = files;
          build(err2);
        }))
      .catch(e => die(e));
  } catch (e) {
    die(e);
  }
};

'use strict';

let tarima;

const $ = require('./utils');

const path = require('path');
const Promise = require('es6-promise');
const micromatch = require('micromatch');

const logger = require('./logger');
const readFiles = require('./read');
const compileFiles = require('./compile');

const plugableSupportAPI = require('./hooks');
const cacheableSupportAPI = require('./caching');

function makeReplacement(obj, test, rename) {
  return value => {
    const dir = obj.dest || obj.cwd;
    const rel = value ? path.relative(dir, value) : path.relative(obj.cwd, dir);
    const ok = test(rel);

    if (ok) {
      const ext = path.extname(rel);

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
            h++;
            continue;
          }

          if (a === b) {
            h++;
            parts[j] = keys[h];
            h++;
            j++;
            continue;
          }

          _test.push(a);
          j++;
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
module.exports = (options, done) => {
  if (!Array.isArray(options.bundle)) {
    options.bundle = options.bundle === true ? ['**'] : options.bundle ? [options.bundle] : [];
  }

  // resolve all relative paths
  ['dest', 'public', 'reload', 'cacheFile', 'rollupFile'].forEach(subpath => {
    if (options[subpath]) {
      options[subpath] = Array.isArray(options[subpath]) ?
        options[subpath].map(subdir => {
          return path.resolve(options.cwd, subdir);
        }) : path.resolve(options.cwd, options[subpath]);
    }
  });

  const filters = Array.isArray(options.filter) ? options.filter : ['**'];
  const context = plugableSupportAPI(logger, options);

  // initialize meta-bundler
  /* eslint-disable global-require */
  tarima = tarima || require('../../lib');

  options.ignore = options.ignore || [];
  options.locals = options.locals || {};
  options.rename = options.rename || [];

  // devPlugins works only on watch/server mode
  options.plugins = options.plugins || [];
  options.devPlugins = options.devPlugins || [];

  // internally used
  context.cache = cacheableSupportAPI(options.cacheFile);
  context.match = $.makeFilter(false, filters);

  options.pluginOptions = options.pluginOptions || {};
  options.bundleOptions = options.bundleOptions || {};

  options.bundleOptions.locals = options.bundleOptions.locals || {};
  options.bundleOptions.globals = options.bundleOptions.globals || {};

  options.bundleOptions.rollup = options.bundleOptions.rollup || {};
  options.bundleOptions.helpers = options.bundleOptions.helpers || {};
  options.bundleOptions.resources = options.bundleOptions.resources || [];

  function die(error) {
    done.call(context, Array.isArray(error) ? error.map(err => {
      return err.message || err.toString();
    }).join('\n') : error);
  }

  if (!$.exists(options.dest)) {
    options.force = true;
  }

  let src = [];

  const plugs = Promise.all((options.plugins || [])
    // conditionally load devPlugins
    .concat(options.flags.watch === true ? options.devPlugins || [] : [])
      .map(file => {
        const testFile = path.resolve(file);

        return require($.isFile(testFile) ? testFile : file);
      })
      .sort((a, b) => b.length - a.length)
      .map(cb => {
        if (!cb) {
          return null;
        }

        return new Promise((resolve, reject) => {
          function next(e) {
            if (e) {
              reject(e);
            } else {
              resolve();
            }
          }

          // ES6 interop
          cb = cb.default || cb;

          if (cb.length) {
            cb.call(context, next);
          } else {
            cb.call(context);
            next();
          }
        });
      }));

  const opts = plugs.then(() => {
    if (options.ignoreFiles) {
      options.ignoreFiles.forEach(ifile => {
        if ($.isFile(ifile)) {
          const lines = $.read(ifile).toString().split('\n');

          lines.forEach(line => {
            if (line.length && (line[0] !== '#') && (options.ignore.indexOf(line) === -1)) {
              const offset = line.indexOf('/');

              if (offset === -1) {
                options.ignore.push(`**/${line}`);

                if (line.indexOf('.') === -1 && line.indexOf('*') === -1) {
                  options.ignore.push(`**/${line}/**`);
                  options.ignore.push(`${line}/**`);
                }

                options.ignore.push(line);
                return;
              }

              if (offset === 0) {
                line = line.substring(1);
              }

              if (line.charAt(line.length - 1) === '/') {
                options.ignore.push(line.slice(0, -1));
                options.ignore.push(`${line}**`);
              } else {
                options.ignore.push(line);
              }
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
  });

  let _state = 'pending';
  let close;

  context.state = value => _state === value;

  function end(err, result) {
    try {
      if (close) {
        close.call(null, err, result);
        close = null;
      }

      _state = 'pending';

      context.cache.save();

      done.call(context, err, result);
      context.emit('end', err, result);

      if (typeof options.reload === 'string') {
        logger.getLogger()
          .info('{log.gray|Running %s}', options.reload);

        options.reload = require(options.reload);
      }

      if (typeof options.reload === 'function') {
        close = options.reload.call(context, context);
      }
    } catch (e) {
      _state = 'errored';

      done.call(context, e, result);
      context.emit('end', e, result);
    }
  }

  function build(err) {
    if (!err) {
      try {
        compileFiles.call(context, tarima, src, end);
        _state = 'working';
      } catch (e) {
        end(e);
      }
    } else {
      end(err);
    }
  }

  try {
    opts
    .catch(die)
    .then(() => {
      readFiles.call(context, (err2, files) => {
        if (_state === 'working') {
          _state = 'abort';
        }

        if (_state === 'pending') {
          src = files;
          build(err2);
        }
      });
    });
  } catch (e) {
    die(e);
  }
};

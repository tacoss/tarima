'use strict';

/* eslint-disable no-restricted-syntax */

const $ = require('./utils');

const Promise = require('es6-promise').Promise;

function dispatch(files, run) {
  const cb = [];
  const src = [];
  const unknown = [];
  const filters = this;

  files.forEach(file => {
    for (const k in filters) {
      if (filters[k].matches(file.src)) {
        if (!src[k]) {
          cb[k] = filters[k].finish;
          src[k] = [];
        }

        src[k].push(file);
        return;
      }
    }

    unknown.push(file);
  });

  run(unknown, next => {
    Promise.all(cb.map((task, k) => {
      return new Promise((resolve, reject) => {
        task.call(null, src[k], (err, data) => {
          if (err) {
            reject(err);
          } else {
            resolve(data);
          }
        });
      });
    }))
    .then(result => {
      next(undefined, result.reduce((prev, cur) => {
        (cur || []).forEach(val => {
          if (Array.isArray(val)) {
            Array.prototype.push.appl(prev, val);
          } else {
            prev.push(val);
          }
        });

        return prev;
      }, []));
    }).catch(error => {
      next(error);
    });
  });
}

function filter(expr, cb) {
  this.push({
    matches: $.makeFilter(true, $.toArray(expr)),
    finish: cb,
  });
}

function emit(hook) {
  if (this[hook]) {
    /* eslint-disable prefer-spread */
    /* eslint-disable prefer-rest-params */
    this[hook].forEach(cb =>
      cb.apply(null, Array.prototype.slice.call(arguments, 1)));
  }
}

function dist(obj) {
  this.status(new Date(), obj, () => {
    switch (obj.type) {
      case 'concat':
        $.write(obj.dest, obj.src.map(file => {
          return $.read(file);
        }).join('\n'));
        break;

      case 'delete':
        if (!$.isFile(obj.src) && $.isFile(obj.dest)) {
          $.unlink(obj.dest);
        }
        break;

      case 'unlink':
        if ($.isFile(obj.dest)) {
          $.unlink(obj.dest);
        }
        break;

      case 'write':
        $.write(obj.dest, obj.data);
        break;

      case 'copy':
        $.copy(obj.src, obj.dest);
        break;

      default:
        throw new Error(`Unsupported action: ${obj.type}`);
    }
  });
}

function on(hook, cb) {
  if (!this[hook]) {
    this[hook] = [];
  }

  this[hook].push(cb);
}

module.exports = (_logger, options) => {
  const hooks = {};
  const filters = [];

  return {
    util: $,
    opts: options,
    logger: _logger,
    on: on.bind(hooks),
    emit: emit.bind(hooks),
    dist: dist.bind(_logger),
    filter: filter.bind(filters),
    dispatch: dispatch.bind(filters),
  };
};
